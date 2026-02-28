import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TagData = {
  _id: string;
  totalAmount: number;
};

interface Props {
  data: TagData[];
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#F43F5E",
];

const TagAnalytics: React.FC<Props> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Expense Distribution by Tags
        </h2>
        <p className="text-sm text-gray-500">
          Overview of spending categories
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">

        {/* Donut Chart */}
<div className="relative w-[380px] h-[380px]">    
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="totalAmount"
                nameKey="_id"
                outerRadius={160}
                paddingAngle={1}
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    style={{ transition: "all 0.3s ease" }}
                  />
                ))}
              </Pie>
              <Tooltip
              />
            </PieChart>
          </ResponsiveContainer>

        </div>

        {/* Legend */}
        <div className="flex-1 space-y-4">
          {data.map((item, index) => {
            const percentage =
              total > 0
                ? ((item.totalAmount / total) * 100).toFixed(1)
                : 0;

            return (
              <div
                key={item._id}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="text-lg font-medium text-gray-800">
                    {item._id}
                  </span>
                </div>

                <div className="text-sm text-gray-600 flex gap-4">
                  {/* <span>₹{item.totalAmount.toLocaleString()}</span> */}
                  <span className="text-gray-400">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default TagAnalytics;