import React, { useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  ReceiptText,
  Wallet,
} from "lucide-react";
import ExpenseList from "../expenses/AllExpenses";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  originalAmount: number;
  currency: string;
  expenseDate: string;
  status: string;
  flagReason?: string;
  tags: string[];
}

interface Report {
  _id: string;
  reportName: string;
  purpose: string;
  date: string;
  totalAmount: number;
  status: string;
}

interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface Props {
  reports: Report[];
  expensesByReport: Record<string, Expense[]>;
  columns: Column<Expense>[];
  reportPage: Record<string, number>;
  reportTotalPages: Record<string, number>;
  setReportPage: (reportId: string, page: number) => void;
  renderReportActions?: (report: Report) => React.ReactNode;
  renderReportMeta?: (report: Report) => React.ReactNode;
  reportFilters?: Record<string, string>;
  setReportFilters?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const statusConfig: Record<
  string,
  {
    badge: string;
    accent: string;
    dot: string;
  }
> = {
  DRAFT: {
    badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    accent: "from-slate-500/15 via-white to-white",
    dot: "bg-slate-400",
  },
  SUBMITTED: {
    badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    accent: "from-sky-500/15 via-white to-white",
    dot: "bg-sky-500",
  },
  APPROVED: {
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    accent: "from-emerald-500/15 via-white to-white",
    dot: "bg-emerald-500",
  },
  FLAGGED: {
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    accent: "from-rose-500/15 via-white to-white",
    dot: "bg-rose-500",
  },
  REJECTED: {
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    accent: "from-rose-500/15 via-white to-white",
    dot: "bg-rose-500",
  },
};

const fallbackStatus = {
  badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  accent: "from-slate-500/15 via-white to-white",
  dot: "bg-slate-400",
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

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

  if (reports.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <FileSpreadsheet className="h-8 w-8" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-slate-900">No reports created yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Start a new expense report to group related expenses and track the approval journey in
          one place.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      {reports.map((report) => {
        const expenses = expensesByReport[report._id] || [];
        const isOpen = openReport === report._id;
        const statusStyle = statusConfig[report.status] || fallbackStatus;

        return (
          <article
            key={report._id}
            className={`overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br ${statusStyle.accent} shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
          >
            <div
              onClick={() => setOpenReport(isOpen ? null : report._id)}
              className="cursor-pointer p-5 sm:p-6"
            >
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className={`mt-1 h-3 w-3 rounded-full ${statusStyle.dot}`} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                          {report.reportName}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.badge}`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        {report.purpose}
                      </p>

                      {renderReportMeta && <div className="mt-3">{renderReportMeta(report)}</div>}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Report Date
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">
                        {formatDate(report.date)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Wallet className="h-3.5 w-3.5" />
                        Total Amount
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">
                        {formatAmount(report.totalAmount)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <ReceiptText className="h-3.5 w-3.5" />
                        Visible Expenses
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{expenses.length}</div>
                    </div>

                    <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <BriefcaseBusiness className="h-3.5 w-3.5" />
                        Review State
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{report.status}</div>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[240px] xl:items-end">
                  {renderReportActions && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end"
                    >
                      {renderReportActions(report)}
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm xl:min-w-[240px]">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Report Summary
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between gap-4">
                        <span>Total spend</span>
                        <span className="font-semibold text-slate-900">
                          {formatAmount(report.totalAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Items shown</span>
                        <span className="font-semibold text-slate-900">{expenses.length}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-2">
                        <span className="font-medium">Details</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                          {isOpen ? "Hide" : "Show"}
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isOpen && (
              <div className="border-t border-slate-200 bg-white/80 p-4 sm:p-6">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                      Expense Breakdown
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Review, filter, and update the expenses attached to this report.
                    </p>
                  </div>

                  <div className="text-sm text-slate-500">
                    Report page{" "}
                    <span className="font-semibold text-slate-900">
                      {reportPage[report._id] || 1}
                    </span>
                  </div>
                </div>

                <ExpenseList
                  data={expenses}
                  columns={columns}
                  filters={
                    reportFilters && setReportFilters
                      ? {
                          options: ["PENDING", "APPROVED", "REJECTED", "FLAGGED", "ALL"],
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
          </article>
        );
      })}
    </div>
  );
};

export default AllReports;
