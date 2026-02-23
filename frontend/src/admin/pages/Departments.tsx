import { useEffect, useState } from "react";
import axios from "axios";
import DepartmentSection from "../components/department/AddDepartment";
import DepartmentCards from "../components/department/DepartmentCards";

export type Department = {
  _id: string;
  departmentName: string;
  totalBudget: number;
  consumedBudget: number;
  isActive?: boolean;
  createdAt?: string;
};

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch Departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:8000/api/departments/get-department",
        {
          headers: {
            token: localStorage.getItem("token") || "",
          },
        }
      );

      const list = res.data?.departments || res.data;
      setDepartments(list);

    } catch (err) {
      console.error("Fetch department failed");
    } finally {
      setLoading(false);
    }
  };

  // Add Department
  const handleAddDepartment = async (data: {
    departmentName: string;
    totalBudget: string;
  }) => {
    const res = await axios.post(
      "http://localhost:8000/api/departments/add-department",
      {
        departmentName: data.departmentName,
        totalBudget: Number(data.totalBudget),
      },
      {
        headers: {
          token: localStorage.getItem("token") || "",
        },
      }
    );

    // Refresh after add
    await fetchDepartments();

    return res.data;
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="p-6 space-y-6">

      {/* Add Department Component */}
      <DepartmentSection onAddDepartment={handleAddDepartment} />

      {/* Pie Chart Cards */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <DepartmentCards departments={departments} />
      )}
    </div>
  );
};

export default Departments;