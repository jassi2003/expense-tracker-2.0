import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import StatsCards from "../components/dashboard/StatsCards";
import MonthlyExpenseBar from "../components/dashboard/MonthlyExpenseBar";

export type DashboardStats = {
  success: boolean;

  period: {
    from: string;
    to: string;
  };

  approved: {
    totalApprovedAmount: number;
    approvedCount: number;
  };

  pending: {
    pendingAmount: number;
    pendingCount: number;
  };

  rejected: {
    totalAmount: number;
    count: number;
  };

  topDepartment: null | {
    department: string;
    total: number;
  };

  topEmployee: null | {
    userId: string;
    total: number;
  };

  byEmployee: Record<string, number>;
  byDepartment: Record<string, number>;

  generatedAt: string;
};

type MonthlyExpensePoint = {
  month: string;
  totalAmount: number;
  count: number;
};

const Dashboard = () => {
  const token = localStorage.getItem("token") || "";

  const now = new Date();
  const TODAY = 0;
  const [month, setMonth] = useState<number>(TODAY);
  const [year, setYear] = useState<number>(now.getFullYear());

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [monthlyData, setMonthlyData] = useState<MonthlyExpensePoint[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const years = useMemo(() => {
    const y = now.getFullYear();
    return [y - 2, y - 1, y, y + 1, y + 2];
  }, [now]);


  //admin dashboard stats data
  const fetchStats = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.get(
        "http://localhost:8000/api/expenses/admin-dashboard-stats",
        {
          // params: { month: m, year: y },
          headers: { token },
        }
      );
      setStats(res.data);
    } catch (err: any) {
      setStats(null);
      setErrorMsg(
        err?.response?.data?.message || "Failed to fetch dashboard stats"
      );
    } finally {
      setLoading(false);
    }
  };

  //agggregated data 
  const fetchAggregatedStats = async (m = month, y = year) => {
  setLoading(true);
  setErrorMsg("");

  try {
    const res = await axios.get(
      "http://localhost:8000/api/expenses/historical-admin-stats",
      {
        params: { month: m, year: y },
        headers: { token },
      }
    );

    setStats(res.data);
  } catch (err: any) {
    setStats(null);
    setErrorMsg(
      err?.response?.data?.message || "Failed to fetch dashboard stats"
    );
  } finally {
    setLoading(false);
  }
};


  //monthly expenses data 
  const fetchMonthlyGraph = async (y = year) => {
    setMonthlyLoading(true);

    try {
      const res = await axios.get(
        "http://localhost:8000/api/expenses/monthly-expense-summary",
        {
          params: { year: y },
          headers: { token },
        }
      );

setMonthlyData(res.data.data || []);
    } catch (err) {
      setMonthlyData([]);
    } finally {
      setMonthlyLoading(false);
    }
  };

  

useEffect(() => {
   if (month === TODAY) {
    fetchStats(); // live data
  } else {
    fetchAggregatedStats(month, year); // historical snapshot
  }

  fetchMonthlyGraph(year);
}, [month, year]);

  return (
    <div className="p-6 space-y-6">
      {/* Header + Month selector */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Monthly overview of approvals, pending, and top performers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
              >
                  <option value={TODAY}>Today</option>
                <option value={1}>January</option>
                <option value={2}>February</option>
                <option value={3}>March</option>
                <option value={4}>April</option>
                <option value={5}>May</option>
                <option value={6}>June</option>
                <option value={7}>July</option>
                <option value={8}>August</option>
                <option value={9}>September</option>
                <option value={10}>October</option>
                <option value={11}>November</option>
                <option value={12}>December</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
  if (month === TODAY) {
    fetchStats();
  } else {
    fetchAggregatedStats(month, year);
  }

  fetchMonthlyGraph(year);
}}
              className="mt-6 sm:mt-0 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      {loading && (
        <div className="rounded-2xl border bg-white p-6 text-slate-600">
          Loading stats...
        </div>
      )}

      {!loading && errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && (
        <>
<StatsCards stats={stats} isToday={month === TODAY} />
          <div className="mt-6">
            {monthlyLoading ? (
              <div className="rounded-2xl border bg-white p-6 text-slate-600">
                Loading monthly data...
              </div>
            ) : (
              <MonthlyExpenseBar year={year} data={monthlyData} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;