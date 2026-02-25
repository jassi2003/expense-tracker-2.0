import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import CreateExpenseForm from "@/employee/components/expenses/ExpenseForm";
import ExpenseList from "@/employee/components/expenses/AllExpenses";
import EditExpenseModal from "@/employee/components/expenses/EditExpenseModal";

type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  originalAmount: number;
  currency: string;
  expenseDate: string;
  receipt: string;
  status: ExpenseStatus;
  tags: string[];
  raisedBy: {
    userId: string;
    dept: string;
  };
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE = 8;

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] =
    useState<ExpenseStatus>("PENDING");

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:8000/api/expenses/all-expenses",
        {
          headers: { token },
          params: {
            page,
            limit: PAGE_SIZE,
            status: selectedStatus,
          },
        }
      );

      setExpenses(res.data?.expenses || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus]);


  //UPDATE EXPENSE HANDLER
  const handleUpdateExpense = async (
    expenseId: string,
    formData: FormData
  ) => {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:8000/api/expenses/update-expense/${expenseId}`,
      formData,
      {
        headers: {
          token,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    await fetchExpenses();
  };

  //DELETE EXENSE HANDLER
  const handleDeleteExpense = async (expenseId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:8000/api/expenses/delete-expense/${expenseId}`,
        {
          headers: { token },
        }
      );

      await fetchExpenses(); // refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete expense");
    }
  };



  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8">

      {/* ADD BUTTON */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add Expense
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <ExpenseList
          expenses={expenses}
          loading={loading}
          error={error}
          onRefresh={fetchExpenses}
          onEdit={(expense) => setEditingExpense(expense)}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          onDelete={handleDeleteExpense}

        />
      </div>

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmit={handleUpdateExpense}
        />
      )}

    {showCreateModal && (
  <div className="fixed inset-0 z-50 bg-blue-900/40 backdrop-blur-md flex justify-center items-center">
    <div className="w-full max-w-md">
      <CreateExpenseForm
        onCreated={async () => {
          await fetchExpenses();
          setShowCreateModal(false);
        }}
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  </div>
)}
    </div>
  );
};

export default Expenses;