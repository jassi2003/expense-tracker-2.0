import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  SearchX,
  Table2,
  TriangleAlert,
} from "lucide-react";

type Column<T> = {
  header: string;
  accessor: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  showHeader?: boolean;
  filters?: {
    options: string[];
    selected: string;
    onChange: (value: string) => void;
  };
  page?: number;
  totalPages?: number;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
};

function ExpenseList<T extends { _id: string }>({
  data,
  columns,
  loading,
  error,
  showHeader = false,
  filters,
  page,
  totalPages,
  setPage,
}: Props<T>) {
  const showPagination = typeof page === "number" && typeof totalPages === "number" && !!setPage;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {showHeader ? (
        <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#ffffff_60%,_#f8fafc_100%)] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
                <ClipboardList className="h-3.5 w-3.5" />
                EXPENSE LIST
              </div>

              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Structured expense records with clearer review flow
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Scan entries faster, filter status easily.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Visible Rows
                </div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{data.length}</div>
              </div>

              {filters && (
                <div className="min-w-[250px] rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <label
                    htmlFor="expense-status-filter"
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filter Status
                  </label>

                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                      <Table2 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-500">Current selection</div>
                      <select
                        id="expense-status-filter"
                        value={filters.selected}
                        onChange={(e) => {
                          filters.onChange(e.target.value);
                          setPage?.(1);
                        }}
                        className="mt-1 w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-0"
                      >
                        {filters.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : filters ? (
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              Visible rows <span className="font-semibold text-slate-900">{data.length}</span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:min-w-[250px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Table2 className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <label
                  htmlFor="expense-status-filter"
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filter Status
                </label>
                <select
                  id="expense-status-filter"
                  value={filters.selected}
                  onChange={(e) => {
                    filters.onChange(e.target.value);
                    setPage?.(1);
                  }}
                  className="mt-1 w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-0"
                >
                  {filters.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="h-10 w-10 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
          <h4 className="mt-4 text-lg font-semibold text-slate-900">Loading expenses</h4>
          <p className="mt-1 text-sm text-slate-500">Pulling the latest records into the table.</p>
        </div>
      ) : error ? (
        <div className="px-6 py-12">
          <div className="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
              <TriangleAlert className="h-7 w-7" />
            </div>
            <h4 className="mt-4 text-lg font-semibold text-rose-900">Unable to load expenses</h4>
            <p className="mt-2 text-sm text-rose-700">{error}</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="px-6 py-14">
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
              <SearchX className="h-7 w-7" />
            </div>
            <h4 className="mt-4 text-lg font-semibold text-slate-900">No expense records found</h4>
            <p className="mt-2 text-sm text-slate-500">
              Try a different filter or add a new expense to populate this list.
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
                    {columns.map((col) => (
                      <th
                        key={col.header}
                        className={`px-4 py-3 text-left ${col.className ?? ""}`}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {data.map((row, rowIndex) => (
                    <tr
                      key={row._id}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.header}
                          className={`px-4 py-4 align-middle text-slate-700 ${col.className ?? ""}`}
                        >
                          {col.render ? col.render(row) : (row as Record<string, React.ReactNode>)[col.accessor as string]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showPagination && (
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
      )}
    </section>
  );
}

export default ExpenseList;
