import { useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Eye,
  FileText,
  Hourglass,
  IndianRupee,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { Expense } from "@/admin/pages/Expenses";
import ExpenseInfoModal from "./ExpenseInfoModal";

interface Props {
  expenses: Expense[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  selectedStatus: string;
  setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;
  actionError: string;
}

const statusButtons = ["PENDING", "APPROVED", "REJECTED"];

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

const formatAmount = (currency: string, amount: number) => {
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

const AdminExpensesTable: React.FC<Props> = ({
  expenses,
  loading,
  onApprove,
  onReject,
  page,
  totalPages,
  setPage,
  selectedStatus,
  setSelectedStatus,
  actionError,
}) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const summary = useMemo(() => {
    const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const approved = expenses.filter((exp) => exp.status === "APPROVED").length;
    const rejected = expenses.filter((exp) => exp.status === "REJECTED").length;
    const pending = expenses.filter((exp) => exp.status === "PENDING").length;

    return { totalAmount, approved, rejected, pending };
  }, [expenses]);

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_30%),linear-gradient(135deg,_#fafafa_0%,_#ffffff_45%,_#f8fafc_100%)] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                ADMIN REVIEW PANEL
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Review submitted expenses with faster decision-making
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Filter by review state and  inspect key details.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <FileText className="h-3.5 w-3.5" />
                    Visible Expenses
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{expenses.length}</div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Hourglass className="h-3.5 w-3.5" />
                    Pending
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{summary.pending}</div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Approved
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{summary.approved}</div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Visible Total
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {formatAmount("INR", summary.totalAmount)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Review Status
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {statusButtons.map((status) => {
                  const active = selectedStatus === status;

                  return (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setPage(1);
                      }}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-slate-900 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {actionError && (
          <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700 sm:px-6">
            <div className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Loading expenses</h3>
            <p className="mt-1 text-sm text-slate-500">Fetching the latest review queue.</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="px-6 py-14">
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No expenses in this view</h3>
              <p className="mt-2 text-sm text-slate-500">
                Switch the review status to inspect a different set of expense requests.
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 sm:px-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Currency</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {expenses.map((exp, index) => (
                      <tr
                        key={exp._id}
                        className={index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                      >
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">{exp.title}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            Raised by {exp.raisedBy?.userId || "Unknown user"}
                          </div>
                        </td>

                        <td className="px-4 py-4 font-semibold text-slate-900">
                          {formatAmount("INR", exp.amount)}
                        </td>

                        <td className="px-4 py-4 text-slate-600">{exp.currency}</td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                            {exp.raisedBy?.dept || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {new Date(exp.expenseDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[exp.status] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap justify-center gap-2">
                            {exp.status === "PENDING" && (
                              <button
                                onClick={() => onApprove(exp._id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                              >
                                <BadgeCheck className="h-4 w-4" />
                                Approve
                              </button>
                            )}

                            {exp.status === "PENDING" && (
                              <button
                                onClick={() => onReject(exp._id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                              >
                                <CircleX className="h-4 w-4" />
                                Reject
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedExpense(exp)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                              Info
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:px-6">
          <div className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              {page}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <ExpenseInfoModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} />
    </>
  );
};

export default AdminExpensesTable;
