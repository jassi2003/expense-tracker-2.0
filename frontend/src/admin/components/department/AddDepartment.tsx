import { useState } from "react";

type Props = {
  onAddDepartment: (data: {
    departmentName: string;
    totalBudget: string;
  }) => Promise<any>;
};

const DepartmentSection: React.FC<Props> = ({ onAddDepartment }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    departmentName: "",
    totalBudget: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAddDepartment(formData);

      setFormData({ departmentName: "", totalBudget: "" });
      setShowForm(false); // auto close

    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to add department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Departments</h2>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl"
        >
          + Add Department
        </button>
      </div>

      {showForm && (
<div className="fixed inset-0 z-50 bg-blue-900/40 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg">

            <h3 className="text-lg font-semibold mb-4">
              Add Department
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                type="text"
                name="departmentName"
                placeholder="Department Name"
                required
                value={formData.departmentName}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
<input
  type="text"
  name="totalBudget"
  inputMode="numeric"
  placeholder="amount"
  value={formData.totalBudget}
  onChange={(e) => {
    const value = e.target.value;

    // Allow only digits
    if (/^\d*$/.test(value)) {
      setFormData({
        ...formData,
        totalBudget: value,
      });
    }
  }}
  className="w-full border px-3 py-2 rounded-lg"
/>
              

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg"
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentSection;