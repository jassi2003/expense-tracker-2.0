import React from "react";
import type { Expense } from "@/employee/pages/Expenses";

type Props = {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onEdit: (expense: Expense) => void;
  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  selectedStatus: string;
  setSelectedStatus: (status: any) => void;
  onDelete: (id: string) => void;

};

const ExpenseList: React.FC<Props> = ({
  expenses,
  loading,
  error,
  onEdit,
  page,
  totalPages,
  setPage,
  onDelete,
  selectedStatus,
  setSelectedStatus,
}) => {
  const statusButtons = ["PENDING", "APPROVED", "REJECTED"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">

      {/* STATUS FILTER BUTTONS */}
      <div className="flex gap-3 mb-4">
        {statusButtons.map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedStatus(status as any);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${selectedStatus === status
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="p-6">Loading...</div>
      ) : error ? (
        <div className="p-6 text-red-600">{error}</div>
      ) : expenses.length === 0 ? (
        <div className="p-6 text-gray-500">No expenses found</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 uppercase text-xs text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">tags</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Receipt</th>

              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id} className="border-t">
                <td className="px-4 py-3">{exp.title}</td>
              <td>
  {new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: exp.currency,
  }).format(
    Number(
      (exp.originalAmount as any)?.$numberDecimal ??
        exp.originalAmount
    )
  )}
</td>
                <td className="px-4 py-3">
                  {new Date(exp.expenseDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">{exp.tags}</td>
                <td className="px-4 py-3 text-center">{exp.status}</td>
                <td className="px-4 py-3 text-center"><p>
                  {exp.receipt ? (
                    <button
                      onClick={() => window.open(exp.receipt, "_blank")}
                      className="text-blue-600 font-medium hover:underline cursor-pointer"
                    >
                      View Receipt
                    </button>
                  ) : (
                    <span className="text-gray-400">No Receipt</span>
                  )}
                </p></td>
                <td className="px-4 py-3 text-center">
                  {exp.status === "PENDING" ? (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(exp)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(exp._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">

                      <button
                        onClick={() => onDelete(exp._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      )}

      {/* PAGINATION */}
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
    </div>
  );
};

export default ExpenseList;