import React from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  Filter,
  Layers3,
  Package,
} from "lucide-react";
import type { PurchaseRequest } from "@/employee/pages/PurchaseRequests";

interface Props {
  requests: PurchaseRequest[];
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  renderActions?: (req: PurchaseRequest) => React.ReactNode;
  statusOptions: string[];
  showRequesterInfo?: boolean;
}

const statusConfig: Record<
  string,
  {
    badge: string;
    dot: string;
    accent: string;
  }
> = {
  DRAFT: {
    badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    dot: "bg-slate-400",
    accent: "from-slate-500/15 via-white to-white",
  },
  PENDING: {
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
    accent: "from-amber-500/15 via-white to-white",
  },
  SUBMITTED: {
    badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    dot: "bg-sky-500",
    accent: "from-sky-500/15 via-white to-white",
  },
  APPROVED: {
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    accent: "from-emerald-500/15 via-white to-white",
  },
  REJECTED: {
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    dot: "bg-rose-500",
    accent: "from-rose-500/15 via-white to-white",
  },
  FLAGGED: {
    badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    dot: "bg-violet-500",
    accent: "from-violet-500/15 via-white to-white",
  },
};

const fallbackStatus = {
  badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  dot: "bg-slate-400",
  accent: "from-slate-500/15 via-white to-white",
};

const formatMoney = (currency: string, amount: number) => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const PurchaseRequestList: React.FC<Props> = ({
  requests,
  statusFilter,
  setStatusFilter,
  page,
  setPage,
  totalPages,
  renderActions,
  statusOptions,
  showRequesterInfo,
}) => {
  const visibleTotal = requests.length;
  const submittedCount = requests.filter((req) => req.status === "SUBMITTED").length;
  const approvedCount = requests.filter((req) => req.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#ffffff_55%,_#f8fafc_100%)] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-500 ring-1 ring-slate-200 backdrop-blur">
                <ClipboardList className="h-3.5 w-3.5" />
                PURCHASE OVERVIEW
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Keep every request clear, trackable, and ready for approval
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Review active purchase requests, monitor approval progress.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Visible Requests
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{visibleTotal}</div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Submitted
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{submittedCount}</div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Approved
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{approvedCount}</div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
              <label
                htmlFor="purchase-status-filter"
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                <Filter className="h-3.5 w-3.5" />
                Filter By Status
              </label>

              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <Layers3 className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-500">Current view</div>
                  <select
                    id="purchase-status-filter"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="mt-1 w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-0"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {requests.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-900">No purchase requests found</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Try switching the status filter or raise a new request to start tracking purchases
            here.
          </p>
        </section>
      ) : (
        <div className="grid gap-5">
          {requests.map((req) => {
            const statusStyle = statusConfig[req.status] || fallbackStatus;

            return (
              <article
                key={req._id}
                className={`group overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br ${statusStyle.accent} shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
              >
                <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className={`mt-1 h-3 w-3 rounded-full ${statusStyle.dot}`} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                            {req.title}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.badge}`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                          {req.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Category
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          {req.category || "Uncategorized"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Quantity
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">{req.quantity}</div>
                      </div>

                      <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Estimated Cost
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          {formatMoney(req.currency, req.estimatedCost)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Requested On
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          {formatDate(req.date)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                      {showRequesterInfo && req.raisedBy && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">Requester:</span>
                          <span>{req.raisedBy.userId}</span>
                          <span className="text-slate-300">|</span>
                          <span>{req.raisedBy.dept}</span>
                        </div>
                      )}

                      {req.productLink && (
                        <a
                          href={req.productLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-semibold text-sky-700 transition hover:text-sky-800"
                        >
                          View product
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[220px] lg:items-end">
                    {renderActions && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end"
                      >
                        {renderActions(req)}
                      </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm lg:min-w-[220px]">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Request Snapshot
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-4">
                          <span>Unit cost</span>
                          <span className="font-semibold text-slate-900">
                            {formatMoney(req.currency, req.estimatedCost)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span>Qty x rate</span>
                          <span className="font-semibold text-slate-900">
                            {req.quantity} x {req.currency}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-2">
                          <span className="font-medium">Current state</span>
                          <span className="font-semibold text-slate-900">{req.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {requests.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row">
          <div className="text-sm text-slate-500">
            Showing page <span className="font-semibold text-slate-900">{page}</span> of{" "}
            <span className="font-semibold text-slate-900">{Math.max(totalPages, 1)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {page}
            </div>

            <button
              disabled={page >= Math.max(totalPages, 1)}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequestList;
