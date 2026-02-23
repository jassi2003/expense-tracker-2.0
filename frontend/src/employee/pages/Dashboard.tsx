import { useCallback, useEffect, useState } from "react";
import axios from "axios";

// import MarkedForReview from "@/components/dashboard/MarkedForReview";
import Summary from "@/employee/components/dashboard/Summary";
import Chart from "@/employee/components/dashboard/Chart";
import TagAnalytics from "../components/dashboard/TagAnalytics";



/* ---------------- TYPES ---------------- */
type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  currency: string;
  expenseDate: string;
  status: ExpenseStatus;
  tags: string[];
  receipt: string;
  raisedBy: { userId: string; dept: string };
  createdAt: string;
  updatedAt: string;
}

export type SummaryData = {
  total: number;
  approved: number;
  pending: number;
  monthlyAverage: number;
};
/* -------------------------------------- */

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  const [loading, setLoading] = useState(true);
  const [tagData, setTagData] = useState([]);
  const [error, setError] = useState<string | null>(null);

  //Fetching dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        setExpenses([]);
        setSummary(null);
        return;
      }

      //  Calling both APIs in parallel
      const [expensesRes, summaryRes, tagAnalyticsRes] = await Promise.all([
        axios.get("http://localhost:8000/api/expenses/all-expenses", {
          headers: { token },
        }),
        axios.get("http://localhost:8000/api/expenses/expense-summary", {
          headers: { token },
        }),
        axios.get(
          "http://localhost:8000/api/expenses/tag-analytics",
          { headers: { token } }
        )
      ]);
      setExpenses(expensesRes.data?.expenses || []);
      setSummary(summaryRes.data?.summary || null);
      setTagData(tagAnalyticsRes.data.analytics);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard");
      setExpenses([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

        <button
          onClick={fetchDashboardData}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Top row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Chart expenses={expenses} loading={loading} />
        </div>
        <Summary summary={summary} loading={loading} />
        <div>
          <TagAnalytics data={tagData} />
        </div>


      </div>


    </div>
  );
}
