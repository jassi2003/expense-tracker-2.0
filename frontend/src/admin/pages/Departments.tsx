import { useEffect, useState } from "react";
import axios from "axios";
import DepartmentSection from "../components/department/AddDepartment";
import DepartmentCards from "../components/department/DepartmentCards";
import UpdateDepartmentModal from "../components/department/UpdateDepttModal";


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
const token=localStorage.getItem("token") || "";
const [selectedDept, setSelectedDept] = useState<Department | null>(null);
const [isUpdateOpen, setIsUpdateOpen] = useState(false);



  // Fetch Departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:8000/api/departments/get-department",
        {
          headers: {
            token
          },
        }
      );

      const list = res.data?.departments || res.data;
      setDepartments(list);

    } catch (err) {
      console.error("Fetch department failed");
      throw err;
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

//HANDLE TOGGLE DEPARTMENT
const handleToggleDepartment = async (dept: Department) => {
  try {
    const url = dept.isActive
      ? `http://localhost:8000/api/departments/deactivate-department/${dept._id}`
      : `http://localhost:8000/api/departments/activate-department/${dept._id}`;

    await axios.put(
      url,
      {},
      {
        headers: {
          token: localStorage.getItem("token") || "",
        },
      }
    );

    await fetchDepartments();
  } catch (error) {
    console.error("Toggle failed");
    throw error;
  }
};

//update department
const handleUpdateDepartment = async (
  departmentId: string,
  departmentName: string,
  totalBudget: number
) => {
  try {
    await axios.put(
      `http://localhost:8000/api/departments/update-department/${departmentId}`,
      {
        departmentName,
        totalBudget,
      },
      {
        headers: {
          token: localStorage.getItem("token") || "",
        },
      }
    );

    setIsUpdateOpen(false);
    await fetchDepartments();
  } catch (error: any) {
  console.error("Update failed");
  throw error;
}
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
<DepartmentCards
  departments={departments}
  onToggle={handleToggleDepartment}
  onOpenUpdate={(dept) => {
    setSelectedDept(dept);
    setIsUpdateOpen(true);
  }}
/>  


)}
{isUpdateOpen && selectedDept && (
  <UpdateDepartmentModal
    department={selectedDept}
    onClose={() => setIsUpdateOpen(false)}
    onUpdate={handleUpdateDepartment}
  />
)}
    </div>
  );
};

export default Departments;