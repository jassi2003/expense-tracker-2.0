import { useState } from "react";
import axios from "axios";
import { getQuarterDates } from "../utils/GetQuarterDates";
import GenerateReport from "../components/report/GenerateReport";

type ReportType = {
  success: boolean;
  fromDate: string;
  toDate: string;
  totalExpenseAmt: number;
  ExpenseCount: number;
  byDepartment: { _id: string; total: number; count: number }[];
  byEmployee: { _id: string; total: number; count: number }[];
  generatedAt: string;
};

export default function ReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(1);
  const [report, setReport] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const { startDate, endDate } = getQuarterDates(year, quarter);

    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:8000/api/expenses/admin-report",
        {
          headers: { token: localStorage.getItem("token") },
          params: {
            startDate,
            endDate,
          },
        }
      );

      setReport(res.data);
    } catch (err) {
      console.error("Report error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4 items-center">
        <select
          value={quarter}
          onChange={(e) => setQuarter(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value={1}>Q1 (Jan-Mar)</option>
          <option value={2}>Q2 (Apr-Jun)</option>
          <option value={3}>Q3 (Jul-Sep)</option>
          <option value={4}>Q4 (Oct-Dec)</option>
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border p-2 rounded w-24"
        />

        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {report && <GenerateReport report={report} />}
    </div>
  );
}