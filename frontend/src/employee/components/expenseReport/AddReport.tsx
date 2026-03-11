import React, { useState } from "react";

interface Props {
  closeModal: () => void;
  createReport: (data: {
    reportName: string;
    purpose: string;
    date: string;
  }) => void;
}

const AddReport: React.FC<Props> = ({ closeModal, createReport }) => {
  const [form, setForm] = useState({
    reportName: "",
    purpose: "",
    date: "",
  });




  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReport(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Create Report</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Report Name"
            className="w-full border p-2 rounded"
            value={form.reportName}
            onChange={(e) =>
              setForm({ ...form, reportName: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Purpose"
            className="w-full border p-2 rounded"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            required
          />

          <input
            type="date"
            className="w-full border p-2 rounded"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReport;