import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { CreditCard, CheckCircle2, Clock, TrendingUp } from "lucide-react";

type SummaryData = {
  total: number;
  approved: number;
  pending: number;
  monthlyAverage: number;
  selectedMonth?: string;
  selectedMonthLabel?: string;
};

type MonthOption = {
  value: string;
  label: string;
  month: number;
  year: number;
};

const getCurrentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

function formatINR(num: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(num);
}

export default function Summary() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setSummary(null);
        return;
      }

      const [year, month] = selectedMonth.split("-").map(Number);

      const res = await axios.get("http://localhost:8000/api/expenses/expense-summary", {
        headers: { token },
        params: { month, year },
      });

      setSummary(res.data?.summary || null);
      setMonthOptions(res.data?.availableMonths || []);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const s = summary ?? { total: 0, approved: 0, pending: 0, monthlyAverage: 0 };

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="text-xs font-semibold tracking-wide text-slate-600">
          MONTH SUMMARY
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            {summary?.selectedMonthLabel || "Current Month"}
          </div>
          <div className="rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
            <label htmlFor="summary-month-filter" className="sr-only">
              Select month
            </label>
            <select
              id="summary-month-filter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
            >
              {monthOptions.length > 0 ? (
                monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              ) : (
                <option value={selectedMonth}>
                  {summary?.selectedMonthLabel || "Current Month"}
                </option>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-slate-500">Loading summary...</div>
        ) : (
          <>
            <Row icon={<CreditCard className="h-4 w-4" />} label="Total Expenses" value={formatINR(s.total)} />
            <Row icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} label="Approved Expenses" value={formatINR(s.approved)} />
            <Row icon={<Clock className="h-4 w-4 text-yellow-600" />} label="Pending Expenses" value={formatINR(s.pending)} />
            <Row icon={<TrendingUp className="h-4 w-4 text-blue-600" />} label="Monthly Average Spend" value={formatINR(s.monthlyAverage)} />
          </>
        )}
      </div>
    </section>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-4">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm text-slate-700">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="truncate text-base font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}
