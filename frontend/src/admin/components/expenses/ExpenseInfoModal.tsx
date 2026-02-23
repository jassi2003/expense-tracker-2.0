import type { Expense } from "@/admin/pages/Expenses";

interface Props {
  expense: Expense | null;
  onClose: () => void;
}

const ExpenseInfoModal: React.FC<Props> = ({ expense, onClose }) => {
  if (!expense) return null;

  return (
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-[500px] rounded-xl shadow-2xl p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Expense Details
        </h2>

        <div className="space-y-2 text-sm">
          <p><strong>Title:</strong> {expense.title}</p>
          <p><strong>Amount:</strong> {expense.amount} {expense.currency}</p>
          <p><strong>Status:</strong> {expense.status}</p>
          <p><strong>Department:</strong> {expense.raisedBy?.dept}</p>
          <p><strong>User ID:</strong> {expense.raisedBy?.userId}</p>
          <p><strong>Date:</strong> {new Date(expense.expenseDate).toLocaleDateString()}</p>
          <p><strong>Tags:</strong> {expense.tags.join(", ")}</p>
<p>
  <strong>Receipt:</strong>{" "}
  {expense.receipt ? (
    <a
      href={expense.receipt}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline cursor-pointer"
    >
      View Receipt
    </a>
  ) : (
    <span className="text-gray-400">No receipt uploaded</span>
  )}
</p>        </div>
      </div>
    </div>
  );
};

export default ExpenseInfoModal;