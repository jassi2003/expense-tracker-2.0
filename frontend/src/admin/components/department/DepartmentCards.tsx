import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Department } from "../../pages/Departments";
import { MoreVertical } from "lucide-react";
import { useState } from "react";


type Props = {
  departments: Department[];
  onToggle: (dept: Department) => void;
  onOpenUpdate: (dept: Department) => void;
};


const COLORS = ["#0f172a", "#10b981"];

const DepartmentCards: React.FC<Props> = ({ departments,onToggle,onOpenUpdate }) => {
  if (!departments.length) {
    return <div>No departments found</div>;
  }
  const [openId, setOpenId] = useState<string | null>(null);
  
  return (
  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
    {departments.map((dept) => {
      const remaining = dept.totalBudget - dept.consumedBudget;
      const formattedRemaining = remaining.toFixed(2);

      const data = [
        { name: "Consumed", value: dept.consumedBudget },
        { name: "Remaining", value: remaining },
      ];

      return (
        <div
          key={dept._id}
          className="relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition"
        >
          {/* 3 DOT ICON */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() =>
                setOpenId(openId === dept._id ? null : dept._id)
              }
              className="p-1 rounded-md hover:bg-slate-100 transition"
            >
              <MoreVertical size={18} />
            </button>

            {openId === dept._id && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    onToggle(dept);
                    setOpenId(null);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                >
                  {dept.isActive ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => {
                    onOpenUpdate(dept);
                    setOpenId(null);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Update Department
                </button>
              </div>
            )}
          </div>

          {/* Department Name + Status */}
          <div className="flex items-center justify-between mb-4 pr-6">
            <h3 className="text-lg font-semibold">
              {dept.departmentName}
            </h3>

            <span
              className={`text-xs px-2 py-1 rounded-full ${
                dept.isActive
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {dept.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Pie Chart */}
          <div className="h-52">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Info */}
          <div className="mt-4 space-y-1 text-sm">
            <p>Total: ₹{dept.totalBudget}</p>
            <p>Consumed: ₹{dept.consumedBudget}</p>
         <p className="font-medium text-emerald-600">
  Remaining: ₹{formattedRemaining}
</p>
          </div>
        </div>
      );
    })}
  </div>
);
}

export default DepartmentCards;