import { useEffect, useMemo, useState } from "react";

type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED";

type Expense = {
  _id: string;
  title: string;
  amount: number;
  currency: string;
  expenseDate: string;
  status: ExpenseStatus;
  tags: string[];
  raisedBy?: { userId: string; dept: string };
};

type Report = {
  fromDate: string;
  toDate: string;
  employeeUserId: string;
  totalAmount: number;
  expenseCount: number;
  byStatus: Record<string, { total: number; count: number }>;
  byMonth: Record<string, { total: number; count: number }>;
  byTag: Record<string, { total: number; count: number }>;
  byDayOfWeek: Record<string, { total: number; count: number }>;
  currency: string;
  department: string | null;
  generatedAt: string;
};

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n || 0);
}

function decodeJwtPayload(token: string): any | null {
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Reports() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fromDate, setFromDate] = useState(
    () => startOfMonth.toISOString().slice(0, 10)
  );
  const [toDate, setToDate] = useState(
    () => today.toISOString().slice(0, 10)
  );

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const employeeUserId = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const decoded = decodeJwtPayload(token);
    return decoded?.userId ?? decoded?.payload?.userId ?? "";
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8000/api/expenses/all-expenses", {
      headers: { token },
    })
      .then((r) => r.json())
      .then((d) =>
        setExpenses(Array.isArray(d?.expenses) ? d.expenses : [])
      )
      .catch(() => {});
  }, []);

  const generateReport = () => {
    setErr(null);

    if (!employeeUserId) return setErr("User not authenticated");
    if (!fromDate || !toDate)
      return setErr("Please select From and To dates");
    if (new Date(fromDate) > new Date(toDate))
      return setErr("From date cannot be after To date");

    setLoading(true);
    setReport(null);

    const worker = new Worker(
      new URL("../../workers/employeeReport.worker.js", import.meta.url),
      { type: "module" }
    );

    worker.postMessage({
      type: "GENERATE_EMPLOYEE_REPORT",
      payload: {
        expenses,
        fromDate,
        toDate,
        employeeUserId,
        includeStatuses: ["APPROVED"],
      },
    });

    worker.onmessage = (e) => {
      if (e.data?.type === "DONE") {
        setReport(e.data.payload as Report);
        setLoading(false);
        worker.terminate();
      }
    };

    worker.onerror = () => {
      setErr("Worker failed to generate report");
      setLoading(false);
      worker.terminate();
    };
  };

  return (
    <div className="report-page space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Reports
        </h1>
        <p className="text-sm text-slate-500">
          Generate employee expense report.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">
              From
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              To
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-3 text-sm text-red-600">{err}</div>
        )}
      </div>

      {/* Report Section */}
      {report && (
        <>
          {/* Summary */}
          <div className="grid gap-4 lg:grid-cols-3">
            <SummaryCard
              title="Total Approved Spend"
              value={formatINR(report.totalAmount)}
              subtitle={`Range: ${fromDate} → ${toDate}`}
            />
            <SummaryCard
              title="Approved Expense Count"
              value={report.expenseCount}
              subtitle="Only APPROVED counted"
            />
            <SummaryCard
              title="Generated At"
              value={new Date(
                report.generatedAt
              ).toLocaleString()}
              subtitle={`Employee: ${employeeUserId}`}
            />
          </div>

          {/* Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownTable
              title="By Status"
              rows={objectRows(report.byStatus)}
              emptyText="No data available"
            />
            <BreakdownTable
              title="By Month"
              rows={objectRows(report.byMonth)}
              emptyText="No data available"
            />
            <BreakdownTable
              title="By Tag"
              rows={objectRows(report.byTag).slice(0, 8)}
              emptyText="No data available"
              note="Showing top 8 tags"
            />
            <BreakdownTable
              title="By Day of Week"
              rows={objectRows(report.byDayOfWeek)}
              emptyText="No data available"
            />
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: any;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold text-slate-600">
        {title}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-500">
        {subtitle}
      </div>
    </div>
  );
}

function objectRows(
  obj: Record<string, { total: number; count: number }>
) {
  return Object.entries(obj)
    .map(([key, val]) => ({ key, ...val }))
    .sort((a, b) => b.total - a.total);
}

function BreakdownTable({
  title,
  rows,
  emptyText,
  note,
}: {
  title: string;
  rows: Array<{ key: string; total: number; count: number }>;
  emptyText: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex justify-between border-b px-4 py-3 bg-slate-50">
        <div className="text-xs font-semibold text-slate-600">
          {title}
        </div>
        {note && (
          <div className="text-xs text-slate-500">{note}</div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Group</th>
              <th className="px-4 py-3 text-right">Count</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-slate-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.key}>
                  <td className="px-4 py-3">{r.key}</td>
                  <td className="px-4 py-3 text-right">
                    {r.count}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatINR(r.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}