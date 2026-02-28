import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type MonthlyExpensePoint = {
  month: string;
  totalAmount: number;
  count: number;
};

type Props = {
  year: number;
  data: MonthlyExpensePoint[];
    loading?: boolean; 

};

const formatINR = (value: number) => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${value}`;
  }
};

const MonthlyExpenseBar: React.FC<Props> = ({ year, data }) => {
  const hasAnyData = data?.some((d) => (d.totalAmount || 0) > 0);

  if (!data || data.length === 0 || !hasAnyData) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <p className="text-slate-900 font-semibold">Not found</p>
        <p className="text-sm text-slate-500 mt-1">
          No monthly expense data available for {year}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Monthly Approved Expenses ({year})
          </h2>
          <p className="text-sm text-slate-500">
            Total amount per month (hover bars for details)
          </p>
        </div>
      </div>

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={34}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `${v}`} />
            <Tooltip
              formatter={(value: any, name: any) => {
                if (name === "totalAmount") return [formatINR(Number(value)), "Total"];
                return [value, name];
              }}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar dataKey="totalAmount" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">Year Total</p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {formatINR(data.reduce((sum, x) => sum + (x.totalAmount || 0), 0))}
          </p>
        </div>

        <div className="rounded-xl border bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">Total Approved Count</p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {data.reduce((sum, x) => sum + (x.count || 0), 0)}
          </p>
        </div>

        <div className="rounded-xl border bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">Top Month</p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {(() => {
              const best = [...data].sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))[0];
              return best ? `${best.month} (${formatINR(best.totalAmount)})` : "—";
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpenseBar;