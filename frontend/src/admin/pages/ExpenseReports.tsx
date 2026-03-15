import AllReports from '@/employee/components/expenseReport/AllReports'
import { useState, useEffect } from 'react'

interface Report {
  _id: string
  reportName: string
  purpose: string
  date: string
  totalAmount: number
  status: string
  raisedBy?: {
    userId: string
    dept: string
  }
}

interface Expense {
  _id: string
  title: string
  amount: number
  currency: string
  expenseDate: string
  status: string
  originalAmount: number
  tags: string[]
}

const ExpenseReports = () => {

  const token = localStorage.getItem("token") || ""

  const [reports, setReports] = useState<Report[]>([])
  const [expensesByReport, setExpensesByReport] = useState<Record<string, Expense[]>>({})

  // REPORT PAGINATION
  const [reportPage, setReportPage] = useState(1)
  const [reportTotalPages, setReportTotalPages] = useState(1)

  // EXPENSE PAGINATION
  const [expensePageByReport, setExpensePageByReport] = useState<Record<string, number>>({})
  const [expenseTotalPagesByReport, setExpenseTotalPagesByReport] = useState<Record<string, number>>({})

  // FILTERS
  const [reportFilters, setReportFilters] = useState<Record<string, string>>({})

  // FLAG MODAL
  const [flagExpenseId, setFlagExpenseId] = useState<string | null>(null)
  const [flagReason, setFlagReason] = useState("")

  const setReportPageForExpenses = (reportId: string, page: number) => {
    setExpensePageByReport(prev => ({
      ...prev,
      [reportId]: page
    }))
  }

  /*
  FETCH REPORTS
  */
  const fetchReports = async () => {

    const res = await fetch(
      `http://localhost:8000/api/expenseReport/all-reports?page=${reportPage}&limit=4`,
      { headers: { token } }
    )

    const data = await res.json()

    setReports(data.reports || [])
    setReportTotalPages(data.totalPages || 1)
  }

  useEffect(() => {
    fetchReports()
  }, [reportPage])

  /*
  INITIALIZE FILTERS
  */

  useEffect(() => {

    if (reports.length === 0) return

    setReportFilters(prev => {

      const updated = { ...prev }

      reports.forEach(report => {
        if (!updated[report._id]) {
          updated[report._id] = "PENDING"
        }
      })

      return updated
    })

  }, [reports])

  /*
  FETCH EXPENSES
  */

  useEffect(() => {

    if (reports.length === 0) return

    const fetchExpenses = async () => {

      const expensesMap: Record<string, Expense[]> = {}
      const pagesMap: Record<string, number> = {}

      await Promise.all(

        reports.map(async report => {

          const page = expensePageByReport[report._id] || 1
          const status = reportFilters[report._id] || "PENDING"

          const res = await fetch(
            `http://localhost:8000/api/expenseReport/all-expenses/${report._id}?page=${page}&limit=5&status=${status}`,
            { headers: { token } }
          )

          const data = await res.json()

          expensesMap[report._id] = data.expenses || []
          pagesMap[report._id] = data.totalPages || 1
        })
      )

      setExpensesByReport(expensesMap)
      setExpenseTotalPagesByReport(pagesMap)
    }

    fetchExpenses()

  }, [reports, expensePageByReport, reportFilters])

  /*
  ADMIN REVIEW ACTION
  */

  const reviewExpense = async (
    expenseId: string,
    action: "APPROVED" | "REJECTED" | "FLAGGED",
    reason?: string
  ) => {

    await fetch(
      `http://localhost:8000/api/expenseReport/review-expense/${expenseId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token
        },
        body: JSON.stringify({ action, reason })
      }
    )

    // refresh expenses
    setExpensePageByReport(prev => ({ ...prev }))
  }

  /*
  TABLE COLUMNS
  */

  const columns = [
    { header: "Title", accessor: "title" },

    {
      header: "Amount",
      accessor: "",
      render: (exp: Expense) => `${exp.currency} ${exp.amount}`
    },

    {
      header: "Date",
      accessor: "",
      render: (exp: Expense) =>
        new Date(exp.expenseDate).toLocaleDateString()
    },

    { header: "Status", accessor: "status" },

    {
      header: "Actions",
      accessor: "",
      render: (exp: Expense) => (
        <div className="flex gap-2">

          {exp.status === "PENDING" && (
            <>
              <button
                onClick={() => reviewExpense(exp._id, "APPROVED")}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded"
              >
                Approve
              </button>

              <button
                onClick={() => reviewExpense(exp._id, "REJECTED")}
                className="px-2 py-1 bg-red-600 text-white text-xs rounded"
              >
                Reject
              </button>

              <button
                onClick={() => setFlagExpenseId(exp._id)}
                className="px-2 py-1 bg-yellow-500 text-white text-xs rounded"
              >
                Flag
              </button>
            </>
          )}

        </div>
      )
    }
  ]

  return (
    <div className="p-8">

      <h1 className="text-2xl font-semibold mb-6">
        All Employee Reports
      </h1>

      <AllReports
        reports={reports}
        expensesByReport={expensesByReport}
        columns={columns}
        reportPage={expensePageByReport}
        reportTotalPages={expenseTotalPagesByReport}
        setReportPage={setReportPageForExpenses}
        reportFilters={reportFilters}
        setReportFilters={setReportFilters}
        renderReportMeta={(report: Report) => (
          <p className="text-xs text-gray-500">
            Employee: {report.raisedBy?.userId} | Dept: {report.raisedBy?.dept}
          </p>
        )}
      />

      {/* REPORT PAGINATION */}

      <div className="flex justify-center items-center gap-4 mt-8">

        <button
          disabled={reportPage === 1}
          onClick={() => setReportPage(prev => prev - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span>
          Page {reportPage} of {reportTotalPages}
        </span>

        <button
          disabled={reportPage === reportTotalPages}
          onClick={() => setReportPage(prev => prev + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
        >
          Next
        </button>

      </div>

      {/* FLAG MODAL */}

      {flagExpenseId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

          <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">

            <h2 className="text-lg font-semibold mb-3">
              Flag Expense
            </h2>

            <textarea
              placeholder="Enter reason..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-4"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => {
                  setFlagExpenseId(null)
                  setFlagReason("")
                }}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await reviewExpense(flagExpenseId, "FLAGGED", flagReason)
                  setFlagExpenseId(null)
                  setFlagReason("")
                }}
                className="px-3 py-1 bg-yellow-500 text-white rounded"
              >
                Submit
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default ExpenseReports