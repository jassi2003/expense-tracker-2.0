import React, { useState } from "react";
import ExpenseList from "../expenses/AllExpenses";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  currency: string;
  expenseDate: string;
  status: string;
}

interface Report {
  _id: string;
  reportName: string;
  purpose: string;
  date: string;
  totalAmount: number;
  status: string;
}

interface Props {
  reports: Report[];
  expensesByReport: Record<string, Expense[]>;

  columns: any[];

  reportPage: Record<string, number>;
  reportTotalPages: Record<string, number>;
  setReportPage: (reportId: string, page: number) => void;

  renderReportActions?: (report: Report) => React.ReactNode;
  renderReportMeta?: (report: Report) => React.ReactNode;
  
reportFilters?: Record<string, string>;
setReportFilters?: React.Dispatch<
  React.SetStateAction<Record<string, string>>
  >;

}

const AllReports: React.FC<Props> = ({
  reports,
  expensesByReport,
  columns,
  reportPage,
  reportTotalPages,
  setReportPage,
  renderReportActions,
  renderReportMeta,
   reportFilters,
  setReportFilters,
}) => {
  const [openReport, setOpenReport] = useState<string | null>(null);

  return (
  <div className="space-y-5">
    {reports.map((report) => {
      const expenses = expensesByReport[report._id] || [];

      const statusStyle =
        report.status === "DRAFT"
          ? "bg-gray-100 text-gray-600"
          : report.status === "SUBMITTED"
          ? "bg-blue-100 text-blue-700"
          : report.status === "APPROVED"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700";

      return (
        <div
          key={report._id}
          className="
          bg-white
          border border-gray-200
          rounded-xl
          shadow-sm
          transition-all
          hover:shadow-md
          "
        >
          {/* HEADER */}
          <div
            onClick={() =>
              setOpenReport(openReport === report._id ? null : report._id)
            }
            className="
            flex
            justify-between
            items-start
            p-6
            cursor-pointer
            hover:bg-gray-50
            transition
            "
          >
            {/* LEFT SIDE */}
            <div className="flex flex-col">

              <h3 className="text-lg font-semibold text-gray-800">
                {report.reportName.toUpperCase()}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
               Purpose: {report.purpose}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {new Date(report.date).toLocaleDateString()}
              </p>

              {/* STATUS BADGE */}
              <span
                className={`mt-2 text-xs font-medium px-2.5 py-1 rounded-md w-fit ${statusStyle}`}
              >
                {report.status}
              </span>

              {renderReportMeta && renderReportMeta(report)}

            </div>


            {/* RIGHT SIDE */}
            <div className="flex flex-col items-end gap-2">

              {/* ACTIONS (delete/submit etc) */}
              {renderReportActions && (
                <div className="flex items-center gap-3">
                  {renderReportActions(report)}
                </div>
              )}

              {/* AMOUNT */}
              <p className="text-lg font-semibold text-gray-800">
                ₹ {report.totalAmount}
              </p>

            </div>
          </div>


          {/* EXPENSES */}
          {openReport === report._id && (
            <div
              className="
              border-t
              bg-gray-50
              p-6
              "
            >
              <ExpenseList
                data={expenses}
                columns={columns}

                filters={
                  reportFilters && setReportFilters
                    ? {
                        options: [
                          "PENDING",
                          "APPROVED",
                          "REJECTED",
                          "FLAGGED",
                          "ALL",
                        ],
                        selected: reportFilters[report._id] || "PENDING",
                        onChange: (value) =>
                          setReportFilters((prev) => ({
                            ...prev,
                            [report._id]: value,
                          })),
                      }
                    : undefined
                }

                page={reportPage[report._id] || 1}
                totalPages={reportTotalPages[report._id] || 1}

                setPage={(update) => {
                  const newPage =
                    typeof update === "function"
                      ? update(reportPage[report._id] || 1)
                      : update;

                  setReportPage(report._id, newPage);
                }}
              />
            </div>
          )}
        </div>
      );
    })}
  </div>
);
}
export default AllReports;