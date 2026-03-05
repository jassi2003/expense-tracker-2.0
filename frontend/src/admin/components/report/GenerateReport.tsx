type Props = {
  report: any;
  deptPage: number;
  setDeptPage: (n: number) => void;
  userPage: number;
  setUserPage: (n: number) => void;

  deptList: any[];
  selectedDept: string;
  setSelectedDept: (dept: string) => void;
};

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const groupByMonth = (data: any[]) => {
  const grouped: Record<string, any[]> = {};

  data.forEach((item) => {
    const key = `${item.year}-${item.month}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, items]) => {
      const [year, month] = key.split("-");
      return {
        year,
        month,
        monthName: MONTH_NAMES[Number(month)],
        items
      };
    });
};

const DataTable = ({
  title,
  data,
  page,
  setPage,
  isEmployee,
  deptList,
  selectedDept,
  setSelectedDept,
  setUserPage
}: any) => {

  const grouped = groupByMonth(data);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

      {/* HEADER */}
      <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">

        <h3 className="font-semibold text-gray-700">{title}</h3>

        <div className="flex items-center gap-4">

          {/* Department Filter */}
          {isEmployee && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Department:</span>

              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setUserPage(1);
                }}
                className="border px-3 py-1 rounded-md text-sm"
              >
                <option value="">All</option>

                {deptList.map((dept: any) => (
                  <option
                    key={dept.departmentName}
                    value={dept.departmentName}
                  >
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center gap-3 text-sm">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-40"
            >
              Prev
            </button>

            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md font-medium">
              {page}
            </span>

            <button
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100"
            >
              Next
            </button>
          </div>

        </div>
      </div>

      {grouped.map((group: any) => (
        <div key={`${group.year}-${group.month}`}>

          {/* MONTH HEADER */}
          <div className="px-6 py-3 text-sm font-semibold text-gray-600 bg-blue-100 border-t">
            {group.monthName} {group.year}
          </div>

          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                {isEmployee ? (
                  <>
                    <th className="px-6 py-3 text-left">Employee</th>
                    <th className="px-6 py-3 text-left">Department</th>
                    <th className="px-6 py-3 text-left">Approved</th>
                    <th className="px-6 py-3 text-left">Rejected</th>
                    <th className="px-6 py-3 text-left">Total</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left">Department</th>
                    <th className="px-6 py-3 text-left">Approved</th>
                    <th className="px-6 py-3 text-left">Utilization</th>
                    <th className="px-6 py-3 text-left">Total</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {group.items.map((item: any, index: number) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  {isEmployee ? (
                    <>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {item.userId}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {item.dept.toUpperCase()}
                      </td>

                      <td className="px-6 py-4 text-green-600 font-medium">
                        ₹{item.approvedAmount}
                      </td>

                      <td className="px-6 py-4 text-red-600 font-medium">
                        ₹{item.rejectedAmount}
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-800">
                        ₹{item.totalAmount}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {item.dept.toUpperCase()}
                      </td>

                      <td className="px-6 py-4 text-green-600 font-medium">
                        ₹{item.approvedAmount}
                      </td>

                      <td className="px-6 py-4 text-green-600 font-medium">
                        {item.departmentUtilization}%
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-800">
                        ₹{item.totalAmount}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      ))}

    </div>
  );
};

const Card = ({ title, amount, count, color }: any) => {

  const colors: any = {
    green: "bg-green-50 border-green-200",
    yellow: "bg-yellow-50 border-yellow-200",
    red: "bg-red-50 border-red-200"
  };

  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm hover:shadow-md transition ${colors[color]}`}
    >
      <p className="text-sm text-gray-500">{title}</p>

      <h3 className="text-3xl font-bold mt-2 text-gray-800">
        ₹{amount || 0}
      </h3>

      <p className="text-xs text-gray-500 mt-1">
        {count || 0} expenses
      </p>
    </div>
  );
};

export default function GenerateReport({
  report,
  deptPage,
  setDeptPage,
  userPage,
  setUserPage,
  deptList,
  selectedDept,
  setSelectedDept
}: Props) {

  const summary = report?.overallSummary?.[0] || {};

  return (
    <div className="space-y-10 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Expense Analytics
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {report.fromDate} → {report.toDate}
          </p>
        </div>

        <div className="text-sm text-gray-400">
          Generated: {new Date(report.generatedAt).toLocaleDateString()}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Total Expenses"
          color="yellow"
          amount={summary.totalAmount}
          count={summary.totalCount}
        />

        <Card
          title="Approved"
          color="green"
          amount={summary.approvedAmount}
          count={summary.approvedCount}
        />

        <Card
          title="Rejected"
          color="red"
          amount={summary.rejectedAmount}
          count={summary.rejectedCount}
        />
      </div>

      {/* TABLES */}
      <DataTable
        title="Department Analytics"
        data={report.byDepartment}
        page={deptPage}
        setPage={setDeptPage}
      />

      <DataTable
        title="Employee Analytics"
        data={report.byEmployee}
        page={userPage}
        setPage={setUserPage}
        isEmployee
        deptList={deptList}
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        setUserPage={setUserPage}
      />

    </div>
  );
}