import React from "react";
import { CreditCard, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import type { SummaryData } from "@/employee/pages/Dashboard";

function formatINR(num: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(num);
}

export default function Summary({
  summary,
  loading,
}: {
  summary: SummaryData | null;
  loading: boolean;
}) {
  const s = summary ?? { total: 0, approved: 0, pending: 0, monthlyAverage: 0 };

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="text-xs font-semibold tracking-wide text-slate-600">
          OVERALL SUMMARY
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
