// pages/ExpensesPage.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import AllExpenses from "../components/expenses/AllExpenses";


// types/expense.ts

export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface RaisedBy {
  userId: string;
  dept: string;
}

export interface Expense {
  _id: string;
  title: string;
  currency: string;
  amount: number;
  expenseDate: string;
  tags: string[];
  receipt: string;
  status: ExpenseStatus;
  raisedBy: RaisedBy;
  createdAt: string;
  updatedAt: string;
}

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");


  const token = localStorage.getItem("token") || "";

 const PAGE_SIZE = 6;

const [page, setPage] = useState<number>(1);
const [totalPages, setTotalPages] = useState<number>(1);
const [selectedStatus, setSelectedStatus] = useState<string>("PENDING");

const fetchAllExpenses = async (): Promise<void> => {
  try {
    setLoading(true);

    const res = await axios.get(
      "http://localhost:8000/api/expenses/all-expenses-admin",
      {
        headers: { token },
        params: {
          page,
          limit: PAGE_SIZE,
          status: selectedStatus,
        },
      }
    );



    setExpenses(res.data.expenses || []);
    setTotalPages(res.data.pagination.totalPages);
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    setLoading(false);
  }
};




  //  APPROVE
  const approveExpense = async (id: string): Promise<void> => {
    try {
      await axios.put(
        `http://localhost:8000/api/expenses/approve-expense/${id}`,
        {},
        { headers: { token } }
      );

      fetchAllExpenses();
    } catch (error:any) {
      console.error("Approve error:", error);
        const message =
      error.response?.data?.message ||
      "Unable to approve expense. Please try again.";
    setActionError(message);
    }
  };

  //  REJECT
  const rejectExpense = async (id: string): Promise<void> => {
    try {
      await axios.put(
        `http://localhost:8000/api/expenses/reject-expense/${id}`,
        {},
        { headers: { token } }
      );

      fetchAllExpenses();
    } catch (error:any) {
      console.error("Reject error:", error);
        const message =
      error.response?.data?.message ||
      "Unable to reject expense.";
    setActionError(message);
    }
  };

  useEffect(() => {
    fetchAllExpenses();
  }, [page, selectedStatus]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-black mb-6">
        Admin Expense Dashboard
      </h1>

      <AllExpenses
        expenses={expenses}
  loading={loading}
  onApprove={approveExpense}
  onReject={rejectExpense}
  page={page}
  totalPages={totalPages}
  setPage={setPage}
  selectedStatus={selectedStatus}
  setSelectedStatus={setSelectedStatus}
    actionError={actionError}

      />
    </div>
  );
};

export default ExpensesPage;