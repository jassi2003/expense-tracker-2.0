import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Department } from "../../pages/Departments";

type Props = {
  departments: Department[];
};

const COLORS = ["#0f172a", "#10b981"];

const DepartmentCards: React.FC<Props> = ({ departments }) => {
  if (!departments.length) {
    return <div>No departments found</div>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

      {departments.map((dept) => {
        const remaining =
          dept.totalBudget - dept.consumedBudget;

        const data = [
          { name: "Consumed", value: dept.consumedBudget },
          { name: "Remaining", value: remaining },
        ];

        return (
          <div
            key={dept._id}
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold mb-4">
              {dept.departmentName}
            </h3>

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

            <div className="mt-4 space-y-1 text-sm">
              <p>Total: ₹{dept.totalBudget}</p>
              <p>Consumed: ₹{dept.consumedBudget}</p>
              <p className="font-medium text-emerald-600">
                Remaining: ₹{remaining}
              </p>
            </div>
          </div>
        );
      })}

    </div>
  );
};

export default DepartmentCards;