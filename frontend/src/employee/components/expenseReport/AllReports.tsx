import React, { useState } from "react";

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
}

const AllReports: React.FC<Props> = ({ reports, expensesByReport }) => {
  const [openReport, setOpenReport] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {reports.map((report) => {
        const expenses = expensesByReport[report._id] || [];

        return (
          <div
            key={report._id}
            className="bg-white rounded-xl shadow-sm border"
          >
            {/* Report Header */}
            <div
              onClick={() =>
                setOpenReport(
                  openReport === report._id ? null : report._id
                )
              }
              className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50"
            >
              <div>
                <h3 className="text-lg font-semibold">
                  {report.reportName}
                </h3>

                <p className="text-sm text-gray-500">
                  {report.purpose}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(report.date).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-800">
                  ₹ {report.totalAmount}
                </p>

                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {report.status}
                </span>
              </div>
            </div>

            {/* Expenses */}
            {openReport === report._id && (
              <div className="border-t p-5">
                {expenses.length === 0 ? (
                  <div className="text-center text-gray-400 py-6">
                    No expenses in this report
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2">Title</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {expenses.map((exp) => (
                        <tr
                          key={exp._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3">{exp.title}</td>

                          <td>
                            {exp.currency} {exp.amount}
                          </td>

                          <td>
                            {new Date(
                              exp.expenseDate
                            ).toLocaleDateString()}
                          </td>

                          <td>
                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                              {exp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AllReports;