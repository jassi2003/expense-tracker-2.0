import React, { useEffect, useState } from "react";
import AllReports from "../components/expenseReport/AllReports";
import AddReport from "../components/expenseReport/AddReport";
import EditExpenseModal from "../components/expenses/EditExpenseModal";
import { Trash2 } from "lucide-react";

const getStatusStyle = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-600";
    case "SUBMITTED":
      return "bg-blue-100 text-blue-700";
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "FLAGGED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

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
}

const ExpenseReport: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [expensesByReport, setExpensesByReport] = useState<Record<string, Expense[]>>({}); 
   const [openModal, setOpenModal] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [reportPage, setReportPageState] = useState<Record<string, number>>({});
const [reportTotalPages, setReportTotalPages] = useState<Record<string, number>>({});
const [editingExpense, setEditingExpense] = useState<any | null>(null);


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
      "http://localhost:8000/api/expenseReport/my-reports",
      { headers: { token } }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to fetch reports");
      return;
    }

    const reportsData = data.reports || [];
    setReports(reportsData);

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
}, [reportPage]);


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

    // remove report from UI
    setReports((prev) => prev.filter((r) => r._id !== reportId));

    // remove expenses cache
    setExpensesByReport((prev) => {
      const copy = { ...prev };
      delete copy[reportId];
      return copy;
    });

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


//DELETE THE EXPENSE
// const handleDeleteExpense = async (expenseId: string) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this expense?"
//     );

//     if (!confirmDelete) return;

//     try {
//       const token = localStorage.getItem("token");

//       await axios.delete(
//         `http://localhost:8000/api/expenses/delete-expense/${expenseId}`,
//         {
//           headers: { token },
//         }
//       );

//       await fetchExpenses(); // refresh list
//     } catch (err: any) {
//       alert(err.response?.data?.message || "Failed to delete expense");
//     }
//   };




const columns = [
  { header: "Title", accessor: "title" },
  {
    header: "Amount",
    render: (exp: Expense) => `${exp.currency} ${exp.amount}`,
  },
  {
    header: "Date",
    render: (exp: Expense) =>
      new Date(exp.expenseDate).toLocaleDateString(),
  },
  { header: "Status", accessor: "status" },
  {
    header: "Actions",
    render: (exp: Expense) => (
      <button
        onClick={() => setEditingExpense(exp)}
        className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
      >
        Edit
      </button>
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