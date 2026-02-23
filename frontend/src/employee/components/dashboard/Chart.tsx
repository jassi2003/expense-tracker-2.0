import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

import { useMemo } from "react";
import type { Expense } from "@/employee/pages/Dashboard"; // or move types to /types

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

export default function Chart({
  expenses,
  loading,
}: {
  expenses: Expense[];
  loading: boolean;
}) {
  const { labels, values } = useMemo(() => {
    const monthlyTotals = Array(12).fill(0);

    expenses.forEach((exp) => {
      const monthIndex = new Date(exp.expenseDate).getMonth();
      monthlyTotals[monthIndex] += exp.amount;
    });

    return { labels: MONTHS, values: monthlyTotals };
  }, [expenses]);

  const data = {
    labels,
    datasets: [
      {
        label: "Spend",
        data: values,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.15)",
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm h-110">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="text-xs font-semibold tracking-wide text-slate-600">
          SPEND SUMMARY
        </div>
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <div className="h-[260px] flex items-center justify-center text-slate-500">
            Loading chart...
          </div>
        ) : (
          <div className="mt-3 h-[260px] w-full sm:h-[300px]">
            <Line data={data} options={options} />
          </div>
        )}
      </div>
    </section>
  );
}
