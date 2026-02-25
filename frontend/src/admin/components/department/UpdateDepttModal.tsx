import { useState, useEffect } from "react";
import type { Department } from "../../pages/Departments";


type Props = {
  department: Department;
  onClose: () => void;
  onUpdate: (
    departmentId: string,
    departmentName: string,
    totalBudget: number
  ) => Promise<void>;
};

const UpdateDepartmentModal: React.FC<Props> = ({
  department,
  onClose,
  onUpdate,
}) => {
  const [departmentName, setDepartmentName] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [loading, setLoading] = useState(false);
  

  // Prefill existing values
  useEffect(() => {
    setDepartmentName(department.departmentName);
    setTotalBudget(String(department.totalBudget));
  }, [department]);

  const handleSubmit = async () => {
    if (!departmentName.trim()) {
      alert("Department name required");
      return;
    }

    if (!totalBudget || Number(totalBudget) <= 0) {
      alert("Enter valid budget");
      return;
    }

    try {
      setLoading(true);
      await onUpdate(
        department._id,
        departmentName.trim(),
        Number(totalBudget)
      );
    } catch (err) {
      console.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          Update Department
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm">Department Name</label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) =>
                setDepartmentName(e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm">Total Budget</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) =>
                setTotalBudget(e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateDepartmentModal;