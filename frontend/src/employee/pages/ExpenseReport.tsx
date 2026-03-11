import React, { useEffect, useState } from "react";
import AllReports from "../components/expenseReport/AllReports";
import AddReport from "../components/expenseReport/AddReport";

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
const token=localStorage.getItem("token") || ""


  const fetchReports = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/expenseReport/my-reports",
                {  headers: { token }});

                const data = await res.json();
                      const reportsData = data.reports || [];
      setReports(data.reports || []);

          // fetch expenses for each report
      reportsData.forEach(async (report: Report) => {
        const expRes = await fetch(
          `http://localhost:8000/api/expenseReport/expensesInReport/${report._id}`,
          { headers: { token } }
        );

        const expData = await expRes.json();

        setExpensesByReport((prev) => ({
          ...prev,
          [report._id]: expData.expenses || [],
        }));
      });

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const createReport = async (report: {
    reportName: string;
    purpose: string;
    date: string;
  }) => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/expenseReport/create-report",
        {
          method: "POST",
headers: {
  "Content-Type": "application/json",
  token: token || "",
}     ,
     body: JSON.stringify(report),
        }
      );
      const data = await res.json();
console.log("rept creation",data)
      setReports((prev) => [data.report, ...prev]);
      setOpenModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Expense Reports</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Report
        </button>
      </div>

      {/* Reports */}
      <AllReports reports={reports} expensesByReport={expensesByReport} />

      {/* Modal */}
      {openModal && (
        <AddReport
          closeModal={() => setOpenModal(false)}
          createReport={createReport}
        />
      )}
    </div>
  );
};

export default ExpenseReport;