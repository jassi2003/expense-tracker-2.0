import { useState } from "react";
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

  const statusButtons = ["PENDING", "APPROVED", "REJECTED"];

  if (loading) {
    return <p className="text-gray-600">Loading expenses...</p>;
  }

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden p-4">

      {/* ERROR MESSAGE */}
      {actionError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {actionError}
        </div>
      )}

      {/* STATUS BUTTONS */}
      <div className="flex gap-3 mb-4">
        {statusButtons.map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedStatus(status);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-semibold transition cursor-pointer ${selectedStatus === status
                ? "bg-black text-white"
                : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      <table className="min-w-full border border-gray-300">
        <thead className="bg-black text-white">
          <tr>
            <th className="py-3 px-4 text-left">Title</th>
            <th className="py-3 px-4 text-left">Amount</th>
            <th className="py-3 px-4 text-left">Currency</th>
            <th className="py-3 px-4 text-left">Department</th>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((exp) => (
            <tr
              key={exp._id}
              className="border-t border-gray-200 hover:bg-gray-50"
            >
              <td className="py-3 px-4">{exp.title}</td>
              <td className="py-3 px-4">₹{exp.amount}</td>
              <td className="py-3 px-4">{exp.currency}</td>
              <td className="py-3 px-4 uppercase">{exp.raisedBy?.dept}</td>
              <td className="py-3 px-4 uppercase"> {new Date(exp.expenseDate).toLocaleDateString()}</td>

              <td
                className={`py-3 px-4 font-semibold ${exp.status === "APPROVED"
                    ? "text-green-600"
                    : exp.status === "REJECTED"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
              >
                {exp.status}
              </td>

              <td className="py-3 px-4 flex justify-center gap-2">
                {exp.status === "PENDING" && (
                  <button
                    onClick={() => onApprove(exp._id)}
                    className="bg-black text-white px-3 py-1 rounded-md hover:bg-gray-800 cursor-pointer disabled:opacity-40"
                  >
                    Approve
                  </button>

                )}

                {exp.status === "PENDING" && (
                  <button
                    onClick={() => onReject(exp._id)}
                    className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-900 cursor-pointer disabled:opacity-40"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => setSelectedExpense(exp)}
                  className="bg-gray-300 text-black px-3 py-1 rounded-md hover:bg-gray-400 cursor-pointer"
                >
                  Info
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer disabled:opacity-40"
        >
          Prev
        </button>

        <span className="font-semibold">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      <ExpenseInfoModal
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
      />
    </div>
  );
};

export default AdminExpensesTable;