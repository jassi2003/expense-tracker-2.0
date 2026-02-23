import type { DashboardStats } from "../../pages/Dashboard";

type Props = {
  stats: DashboardStats | null;
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

const prettyDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
};

const StatsCards: React.FC<Props> = ({ stats }) => {
  if (!stats || stats.success === false) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-slate-600">
        Not found.
      </div>
    );
  }

  const approvedAmt = stats.approvedThisMonth?.totalApprovedAmount || 0;
  const approvedCount = stats.approvedThisMonth?.approvedCount || 0;

  const pendingCount = stats.pending?.pendingCount || 0;
  const pendingAmt = stats.pending?.pendingAmount || 0;

  // "No data" rule: everything empty/zero AND top objects null
  const noData =
    approvedAmt === 0 &&
    approvedCount === 0 &&
    pendingCount === 0 &&
    pendingAmt === 0 &&
    !stats.topDepartment &&
    !stats.topEmployee;

  if (noData) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <p className="text-slate-900 font-semibold">Not found</p>
        <p className="text-sm text-slate-500 mt-1">
          No stats available for the selected month.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period strip */}
      <div className="rounded-2xl border bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm text-slate-600">
          Period:{" "}
          <span className="font-semibold text-slate-900">
            {prettyDate(stats.period.from)} – {prettyDate(stats.period.to)}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          Generated: {prettyDate(stats.generatedAt)}
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* 1) Approved Amount */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs font-medium text-slate-500">Approved (This Month)</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatINR(approvedAmt)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Count: <span className="font-semibold text-slate-900">{approvedCount}</span>
          </p>
       
        </div>

        {/* 2) Pending */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs font-medium text-slate-500">Pending Approvals</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {pendingCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Amount: <span className="font-semibold text-slate-900">{formatINR(pendingAmt)}</span>
          </p>
         
        </div>

        {/* 3) Top Department */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs font-medium text-slate-500">Top Department</p>

          {stats.topDepartment ? (
            <>
              <p className="mt-2 text-xl font-bold text-slate-900 uppercase">
                {stats.topDepartment.department}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Total:{" "}
                <span className="font-semibold text-slate-900">
                  {formatINR(stats.topDepartment.total)}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Count:{" "}
                <span className="font-semibold text-slate-900">
                  {stats.topDepartment.count}
                </span>
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Not found</p>
          )}

        
        </div>

        {/* 4) Top Employee */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <p className="text-xs font-medium text-slate-500">Top Employee</p>

          {stats.topEmployee ? (
            <>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {stats.topEmployee.userId}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Total:{" "}
                <span className="font-semibold text-slate-900">
                  {formatINR(stats.topEmployee.total)}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Count:{" "}
                <span className="font-semibold text-slate-900">
                  {stats.topEmployee.count}
                </span>
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Not found</p>
          )}

          
        </div>
      </div>
    </div>
  );
};

export default StatsCards;