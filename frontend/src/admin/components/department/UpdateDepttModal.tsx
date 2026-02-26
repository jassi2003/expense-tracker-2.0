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
  const [error, setError] = useState<string | null>(null);

  // Prefill existing values
  useEffect(() => {
    setDepartmentName(department.departmentName);
    setTotalBudget(String(department.totalBudget));
    setError(null);
  }, [department]);

  const handleSubmit = async () => {
    setError(null);

    // Frontend validation
    if (!departmentName.trim()) {
      setError("Department name is required");
      return;
    }

    if (!totalBudget || Number(totalBudget) <= 0) {
      setError("Please enter a valid budget greater than 0");
      return;
    }

    try {
      setLoading(true);

      await onUpdate(
        department._id,
        departmentName.trim(),
        Number(totalBudget)
      );

      onClose(); // close on success
    } catch (err: any) {
      // Handle backend error message
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update department";

      setError(message);
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm">Department Name</label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => {
                setDepartmentName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="text-sm">Total Budget</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => {
                setTotalBudget(e.target.value);
                if (error) setError(null);
              }}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-slate-400"
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