import React, { useEffect, useState } from "react";
import AllReports from "../components/expenseReport/AllReports";
import AddReport from "../components/expenseReport/AddReport";
import EditExpenseModal from "../components/expenses/EditExpenseModal";



export interface Report {
  _id: string;
  employeeId: string;
  reportName: string;
  purpose: string;
  date: string;
  totalAmount: number;
  status: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  currency: string;
  expenseDate: string;
  status: string;
  flagReason?: string;
  originalAmount: number ;
  tags: string[];
}

interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

const REPORTS_PAGE_SIZE = 4;

const ExpenseReport: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [expensesByReport, setExpensesByReport] = useState<Record<string, Expense[]>>({}); 
   const [openModal, setOpenModal] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [reportPage, setReportPageState] = useState<Record<string, number>>({});
  const [reportTotalPages, setReportTotalPages] = useState<Record<string, number>>({});
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);


const token=localStorage.getItem("token") || ""


const setReportPage = (reportId: string, page: number) => {
  setReportPageState((prev) => ({
    ...prev,
    [reportId]: page,
  }));
};

//fetch reports
 const fetchReports = async () => {
  try {
    setError(null);

    const res = await fetch(
      `http://localhost:8000/api/expenseReport/my-reports?page=${reportsPage}&limit=${REPORTS_PAGE_SIZE}`,
      { headers: { token } }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to fetch reports");
      return;
    }

    const reportsData = data.reports || [];
    setReports(reportsData);
    setReportsTotalPages(data.totalPages || 1);

    reportsData.forEach(async (report: Report) => {
      const page = reportPage[report._id] || 1;

      const expRes = await fetch(
        `http://localhost:8000/api/expenseReport/myExpensesInReport/${report._id}?page=${page}&limit=5`,
        { headers: { token } }
      );

      const expData = await expRes.json();

      setExpensesByReport((prev) => ({
        ...prev,
        [report._id]: expData.expenses || [],
      }));

      setReportTotalPages((prev) => ({
        ...prev,
        [report._id]: expData.totalPages || 1,
      }));
    });

  } catch {
    setError("Failed to load reports");
  }
};

useEffect(() => {
  fetchReports();
}, [reportPage, reportsPage]);


  //creating report
  const createReport = async (report: {
  reportName: string;
  purpose: string;
  date: string;
}) => {
  try {
    setError(null);

    const res = await fetch(
      "http://localhost:8000/api/expenseReport/create-report",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(report),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to create report");
      return;
    }

    setReports((prev) => [data.report, ...prev]);
    setReportsPage(1);
    setOpenModal(false);

  } catch {
    setError("Server error while creating report");
  }
};

//SUBMIT THE REPORT 
const submitReport = async (reportId: string) => {
  try {
    setError(null);

    const res = await fetch(
      `http://localhost:8000/api/expenseReport/submit-report/${reportId}`,
      {
        method: "PUT",
        headers: { token },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to submit report");
      return;
    }

    // refresh reports
    await fetchReports();

  } catch {
    setError("Server error while submitting report");
  }
};

//DELETE THE REPORT  
const deleteReport = async (reportId: string) => {
  try {
    setError(null);

    const res = await fetch(
      `http://localhost:8000/api/expenseReport/delete-report/${reportId}`,
      {
        method: "DELETE",
        headers: { token },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to delete report");
      return;
    }

    await fetchReports();

  } catch (err) {
    setError("Server error. Please try again.");
  }
};

//edit the expense
const handleUpdateExpense = async (
  expenseId: string,
  formData: FormData
) => {
  try {
    const res = await fetch(
      `http://localhost:8000/api/expenses/update-expense/${expenseId}`,
      {
        method: "PUT",
        headers: { token },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to update expense");
      return;
    }

    // refresh reports + expenses
    await fetchReports();

  } catch {
    setError("Server error while updating expense");
  }
};

const handleSubmitDraftExpense = async (expenseId: string) => {
  try {
    setError(null);

    const res = await fetch(
      `http://localhost:8000/api/expenses/submit-draftExpense/${expenseId}`,
      {
        method: "PUT",
        headers: { token },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to submit draft expense");
      return;
    }

    await fetchReports();

  } catch {
    setError("Server error while submitting draft expense");
  }
};

const handleSubmitFlaggedExpense = async (expenseId: string) => {
  try {
    setError(null);

    const res = await fetch(
      `http://localhost:8000/api/expenses/submit-flagged-expense/${expenseId}`,
      {
        method: "PUT",
        headers: { token },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to resubmit flagged expense");
      return;
    }

    await fetchReports();

  } catch {
    setError("Server error while resubmitting flagged expense");
  }
};






const columns: Column<Expense>[] = [
  { header: "Title", accessor: "title" },
  {
    header: "Amount",
    accessor: "amount",
    render: (exp: Expense) => `${exp.currency} ${exp.amount}`,
  },
  {
    header: "Date",
    accessor: "expenseDate",
    render: (exp: Expense) =>
      new Date(exp.expenseDate).toLocaleDateString(),
  },
  {
    header: "Status",
    accessor: "status",
    render: (exp: Expense) =>
      exp.status === "FLAGGED" ? (
        <div className="space-y-1">
          <div className="font-medium text-amber-700">{exp.status}</div>
          <div className="max-w-[220px] text-xs leading-5 text-slate-500">
            Reason: {exp.flagReason || "Requires correction"}
          </div>
        </div>
      ) : (
        exp.status
      ),
  },
  {
    header: "Actions",
    accessor: "actions",
    render: (exp: Expense) =>
      exp.status === "DRAFT" || exp.status === "FLAGGED" ? (
        <div className="flex gap-2">
          <button
            onClick={() => setEditingExpense(exp)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
          >
            Edit
          </button>

          {exp.status === "DRAFT" && (
            <button
              onClick={() => handleSubmitDraftExpense(exp._id)}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs"
            >
              Submit
            </button>
          )}

          {exp.status === "FLAGGED" && (
            <button
              onClick={() => handleSubmitFlaggedExpense(exp._id)}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs"
            >
              Submit
            </button>
          )}
        </div>
      ) : (
        <span className="text-xs text-slate-400">No actions</span>
      ),
  },
];




  return (
  <div className="min-h-screen bg-gray-50 p-8">

    {/* Header */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Expense Reports
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create and manage your expense reports
        </p>
      </div>

      <button
        onClick={() => setOpenModal(true)}
        className="
        flex items-center gap-2
        bg-blue-600
        text-white
        px-5 py-2.5
        rounded-lg
        text-sm font-medium
        shadow-sm
        hover:bg-blue-700
        hover:shadow-md
        transition
        "
      >
        + Add Report
      </button>
    </div>


    {/* Error Message */}
    {error && (
      <div className="mb-6 border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error}
      </div>
    )}


    {/* Reports Container */}
    <div className="space-y-5">

      <AllReports
        reports={reports}
        expensesByReport={expensesByReport}
        columns={columns}
        reportPage={reportPage}
        reportTotalPages={reportTotalPages}
        setReportPage={setReportPage}

        renderReportActions={(report) =>
          report.status === "DRAFT" && (
            <div className="flex items-center gap-3">

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this report?")) {
                    deleteReport(report._id);
                  }
                }}
                className="
                text-red-600
                text-sm
                font-medium
                hover:text-red-700
                transition
                "
              >
                Delete
              </button>

              {/* Submit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Submit this report for approval?")) {
                    submitReport(report._id);
                  }
                }}
                className="
                bg-green-600
                text-white
                text-xs
                px-3 py-1.5
                rounded-md
                hover:bg-green-700
                transition
                "
              >
                Submit
              </button>

            </div>
          )
        }
      />

      {reports.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row">
          <div className="text-sm text-slate-500">
            Showing page <span className="font-semibold text-slate-900">{reportsPage}</span> of{" "}
            <span className="font-semibold text-slate-900">{Math.max(reportsTotalPages, 1)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={reportsPage === 1}
              onClick={() => setReportsPage((prev) => prev - 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {reportsPage}
            </div>

            <button
              disabled={reportsPage >= Math.max(reportsTotalPages, 1)}
              onClick={() => setReportsPage((prev) => prev + 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>


    {/* Add Report Modal */}
    {openModal && (
      <AddReport
        closeModal={() => setOpenModal(false)}
        createReport={createReport}
      />
    )}


    {/* Edit Expense Modal */}
    {editingExpense && (
      <EditExpenseModal
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSubmit={handleUpdateExpense}
      />
    )}

  </div>
);
};


export default ExpenseReport;
