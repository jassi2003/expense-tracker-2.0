import { useState } from "react";
import type { AddEmployeePayload, DepartmentOption } from "../../pages/User";

type Props = {
  onAddUser: (data: AddEmployeePayload) => Promise<any>;
  departments: DepartmentOption[];
  departmentsLoading?: boolean;
  onRefreshDepartments?: () => void;
};

const AddUser: React.FC<Props> = ({
  onAddUser,
  departments,
  departmentsLoading = false,
  onRefreshDepartments,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<AddEmployeePayload>({
    userId: "",
    name: "",
    empdepartment: "",
    password: "",
    email: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setErrorMsg("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const closeAndReset = () => {
    setOpen(false);
    setErrorMsg("");
    setFormData({
      userId: "",
      name: "",
      empdepartment: "",
      password: "",
      email: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        userId: formData.userId.trim(),
        name: formData.name.trim(),
        empdepartment: formData.empdepartment.trim(),
      };

      await onAddUser(payload);

      closeAndReset(); //  auto close on success
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Employees</h2>
         
        </div>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
        >
          + Add Employee
        </button>
      </div>

      {open && (
<div className="fixed inset-0 z-50 bg-blue-900/40 backdrop-blur-md flex items-center justify-center">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg border overflow-hidden">
            <div className="p-5 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Add Employee
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Create an employee account and assign a department.
                </p>
              </div>

              <button
                onClick={closeAndReset}
                className="rounded-lg px-3 py-1.5 text-sm border hover:bg-white"
              >
                Close
              </button>
            </div>

            <div className="p-5">
              {errorMsg && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      User ID
                    </label>
                    <input
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Name
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Department
                    </label>

                    <div className="flex gap-2">
                      <select
                        name="empdepartment"
                        value={formData.empdepartment}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-slate-900/20"
                      >
                        <option value="" disabled>
                          {departmentsLoading
                            ? "Loading departments..."
                            : "Select department"}
                        </option>

                        {departments.map((d) => (
                          <option key={d._id} value={d.departmentName}>
                            {d.departmentName}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={onRefreshDepartments}
                        className="px-3 py-2 rounded-xl border hover:bg-slate-50"
                        title="Refresh departments"
                      >
                        ↻
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeAndReset}
                    className="px-4 py-2 rounded-xl border hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading || departmentsLoading}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {loading ? "Creating..." : "Create Employee"}
                  </button>
                </div>
              </form>

              {!departmentsLoading && departments.length === 0 && (
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
                  No departments available. Please add a department first.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;