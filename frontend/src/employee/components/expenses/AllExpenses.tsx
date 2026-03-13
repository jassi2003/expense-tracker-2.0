

import React from "react";


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
  filters,
  page,
  totalPages,
  setPage,
}: Props<T>) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">

      {/* FILTERS */}
     {filters && (
  <div className="flex items-center gap-3 mb-4">
    <label className="text-sm font-medium text-gray-600">
      Filter:
    </label>

    <select
      value={filters.selected}
      onChange={(e) => {
        filters.onChange(e.target.value);
        setPage?.(1);
      }}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {filters.options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
)}

      {/* TABLE */}
      {loading ? (
        <div className="p-6">Loading...</div>
      ) : error ? (
        <div className="p-6 text-red-600">{error}</div>
      ) : data.length === 0 ? (
        <div className="p-6 text-gray-500">No data found</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 uppercase text-xs text-gray-600">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className="px-4 py-3 text-left">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row._id} className="border-t">
                {columns.map((col) => (
                  <td key={col.header} className="px-4 py-3">
                    {col.render
                      ? col.render(row)
                      : (row as any)[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* PAGINATION */}
      {page && totalPages && setPage && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ExpenseList;