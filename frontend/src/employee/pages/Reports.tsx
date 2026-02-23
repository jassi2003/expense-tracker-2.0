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

  // Date range
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fromDate, setFromDate] = useState(() => startOfMonth.toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => today.toISOString().slice(0, 10));

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Get employee userId from token (your token may be {userId,...} or {payload:{userId,...}})
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
      .then((d) => setExpenses(Array.isArray(d?.expenses) ? d.expenses : []))
      .catch(() => {});
  }, []);

  const generateReport = () => {
    setErr(null);

    if (!employeeUserId) {
      setErr("User not authenticated");
      return;
    }
    if (!fromDate || !toDate) {
      setErr("Please select From and To dates");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setErr("From date cannot be after To date");
      return;
    }

    setLoading(true);
    setReport(null);

    const worker = new Worker(new URL("../../workers/employeeReport.worker.js", import.meta.url), {
      type: "module",
    });

    worker.postMessage({
      type: "GENERATE_EMPLOYEE_REPORT",
      payload: {
        expenses,
        fromDate,
        toDate,
        employeeUserId,
        includeStatuses: ["APPROVED"], // report totals only for approved (you can change)
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Generate employee expense report using Web Worker.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">From</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">To</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-600">Total Approved Spend</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {report ? formatINR(report.totalAmount) : "—"}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Range: {fromDate} → {toDate}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-600">Approved Expense Count</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{report ? report.expenseCount : "—"}</div>
          <div className="mt-1 text-xs text-slate-500">Only APPROVED counted in totals</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-600">Generated At</div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {report ? new Date(report.generatedAt).toLocaleString() : "—"}
          </div>
          <div className="mt-1 text-xs text-slate-500">Employee: {employeeUserId || "—"}</div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownTable
          title="By Status"
          rows={report ? objectRows(report.byStatus) : []}
          emptyText={loading ? "Generating..." : "Generate a report to see breakdown."}
        />

        <BreakdownTable
          title="By Month"
          rows={report ? objectRows(report.byMonth) : []}
          emptyText={loading ? "Generating..." : "Generate a report to see breakdown."}
        />

        <BreakdownTable
          title="By Tag"
          rows={report ? objectRows(report.byTag).slice(0, 8) : []}
          emptyText={loading ? "Generating..." : "Generate a report to see breakdown."}
          note="Showing top 8 tags"
        />

        <BreakdownTable
          title="By Day of Week"
          rows={report ? objectRows(report.byDayOfWeek) : []}
          emptyText={loading ? "Generating..." : "Generate a report to see breakdown."}
        />
      </div>    
      </div>
  );
}

function objectRows(obj: Record<string, { total: number; count: number }>) {
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
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="text-xs font-semibold tracking-wide text-slate-600">{title}</div>
        {note ? <div className="text-xs text-slate-500">{note}</div> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white text-xs uppercase tracking-wider text-slate-600">
            <tr className="border-b border-slate-100">
              <th className="px-4 py-3 text-left">Group</th>
              <th className="px-4 py-3 text-right">Count</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-slate-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.key} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.key}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{r.count}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatINR(r.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
