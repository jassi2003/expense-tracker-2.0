import { useEffect, useState } from "react";
import axios from "axios";
import GenerateReport from "../components/report/GenerateReport";

export default function ReportPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [deptPage, setDeptPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const [overall, setOverall] = useState<any>([]);
  const [departments, setDepartments] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);

  const [dates, setDates] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const [deptList, setDeptList] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");

  const [deptTotalPages, setDeptTotalPages] = useState(1);
const [userTotalPages, setUserTotalPages] = useState(1);

  const token = localStorage.getItem("token");

  // 2. Updated Generate Report Logic
  const generateReport = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both dates");
      return;
    }

    setDates({ startDate: fromDate, endDate: toDate });
    setDeptPage(1);
    setUserPage(1);
    setGenerated(true);
  };

  // FETCH DEPARTMENTS
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/departments/get-department",
          { headers: { token } }
        );
        setDeptList(res.data.departments || []);
      } catch (err) {
        console.error("Department fetch failed", err);
      }
    };
    fetchDepartments();
  }, [token]);

  // OVERALL SUMMARY
  useEffect(() => {
    if (!dates || !generated) return;
    const fetchOverall = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:8000/api/expenses/report-overall",
          {
            headers: { token },
            params: { fromDate: dates.startDate, toDate: dates.endDate }
          }
        );
        // Note: Using the fix from the previous response to access nested data
        setOverall(res.data.data?.result || []);
      } catch (err) {
        console.error("Overall API failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverall();
  }, [dates, generated, token]);

  // DEPARTMENT ANALYTICS 
  useEffect(() => {
    if (!dates || !generated) return;
    const fetchDepartmentsAnalytics = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/expenses/report-department",
          {
            headers: { token },
            params: {
              fromDate: dates.startDate,
              toDate: dates.endDate,
              page: deptPage,
              limit: 5
            }
          }
        );
        setDepartments(res.data.data);
        setDeptTotalPages(res.data.deptTotalPages);
      } catch (err) {
        console.error("Department API failed", err);
      }
    };
    fetchDepartmentsAnalytics();
  }, [deptPage, dates, generated, token]);

  // USER ANALYTICS 
  useEffect(() => {
    if (!dates || !generated) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/expenses/report-user",
          {
            headers: { token },
            params: {
              fromDate: dates.startDate,
              toDate: dates.endDate,
              page: userPage,
              limit: 5,
              dept: selectedDept || undefined
            }
          }
        );
        setUsers(res.data.data);
        setUserTotalPages(res.data.userTotalPages);
      } catch (err) {
        console.error("User API failed", err);
      }
    };
    fetchUsers();
  }, [userPage, dates, generated, selectedDept, token]);

  const report = {
    fromDate: dates?.startDate,
    toDate: dates?.endDate,
    generatedAt: new Date(),
    overallSummary: overall,
    byDepartment: departments,
    byEmployee: users
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      
      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-xl shadow flex gap-6 items-center flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            onKeyDown={(e) => e.preventDefault()}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            onKeyDown={(e) => e.preventDefault()}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          onClick={generateReport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium self-end transition-colors"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* REPORT SECTION */}
      {generated && (
       <GenerateReport
  report={report}
  deptPage={deptPage}
  setDeptPage={setDeptPage}
  userPage={userPage}
  setUserPage={setUserPage}
  deptList={deptList}
  selectedDept={selectedDept}
  setSelectedDept={setSelectedDept}
  deptTotalPages={deptTotalPages}
  userTotalPages={userTotalPages}
/>
      )}
    </div>
  );
}