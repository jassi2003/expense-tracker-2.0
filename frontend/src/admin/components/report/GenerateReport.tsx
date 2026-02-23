type ReportProps = {
  report: {
    fromDate: string;
    toDate: string;
    totalExpenseAmt: number;
    ExpenseCount: number;
    byDepartment: { _id: string; total: number; count: number }[];
    byEmployee: { _id: string; total: number; count: number }[];
    generatedAt: string;
  };
};

export default function GenerateReport({ report }: ReportProps) {
  return (
    <div className="mt-8 space-y-10 text-gray-900">

      {/* ================= SUMMARY ================= */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-slate-300">
          Report Summary
        </h2>

        <div className="overflow-hidden border border-slate-600">
          <table className="w-full border-collapse">
            <tbody>
              {[
                ["From Date", report.fromDate],
                ["To Date", report.toDate],
                ["Total Expense Amount", `₹${report.totalExpenseAmt}`],
                ["Expense Count", report.ExpenseCount],
                [
                  "Generated At",
                  new Date(report.generatedAt).toLocaleString(),
                ],
              ].map(([label, value], index) => (
                <tr key={index} className="border-b border-slate-600">
                  <td className="px-4 py-3 border-r border-slate-600 w-1/2">
                    {label}
                  </td>
                  <td className="px-4 py-3">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= DEPARTMENT ================= */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-slate-500">
          By Department
        </h2>

        <div className="overflow-hidden border border-slate-600">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left px-4 py-3 border-r border-slate-600">
                  Department
                </th>
                <th className="text-left px-4 py-3 border-r border-slate-600">
                  Total Amount
                </th>
                <th className="text-left px-4 py-3">
                  Expense Count
                </th>
              </tr>
            </thead>
            <tbody>
              {report.byDepartment.map((dept) => (
                <tr key={dept._id} className="border-b border-slate-600">
                  <td className="px-4 py-3 border-r border-slate-600">
                    {dept._id}
                  </td>
                  <td className="px-4 py-3 border-r border-slate-600">
                    ₹{dept.total}
                  </td>
                  <td className="px-4 py-3">{dept.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EMPLOYEE ================= */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-slate-500">
          By Employee
        </h2>

        <div className="overflow-hidden border border-slate-600">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left px-4 py-3 border-r border-slate-600">
                  Employee
                </th>
                <th className="text-left px-4 py-3 border-r border-slate-600">
                  Total Amount
                </th>
                <th className="text-left px-4 py-3">
                  Expense Count
                </th>
              </tr>
            </thead>
            <tbody>
              {report.byEmployee.map((emp) => (
                <tr key={emp._id} className="border-b border-slate-600">
                  <td className="px-4 py-3 border-r border-slate-600">
                    {emp._id}
                  </td>
                  <td className="px-4 py-3 border-r border-slate-600">
                    ₹{emp.total}
                  </td>
                  <td className="px-4 py-3">{emp.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}