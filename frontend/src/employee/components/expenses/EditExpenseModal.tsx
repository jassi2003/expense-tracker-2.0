import React, { useState } from "react";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  currency: string;
  expenseDate: string;
  tags: string[];
}

interface Props {
  expense: Expense;
  onClose: () => void;
  onSubmit: (expenseId: string, formData: FormData) => Promise<void>;
}

const EditExpenseModal: React.FC<Props> = ({
  expense,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    title: expense.title,
    amount: expense.amount,
    currency: expense.currency,
    expenseDate: expense.expenseDate.split("T")[0],
    tags: expense.tags.join(", "),
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
    const [currentTag, setCurrentTag] = useState("");
      const [tags, setTags] = useState<string[]>([]);
    
  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  //  ADD TAG
  const handleAddTag = () => {
    const trimmed = currentTag.trim().toLowerCase();
    if (!trimmed) return;

    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }

    setCurrentTag("");
  };

  //  REMOVE TAG
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("amount", form.amount.toString());
      formData.append("currency", form.currency);
      formData.append("expenseDate", form.expenseDate);
     formData.append("tags", JSON.stringify(tags)); // send tags array


      if (selectedFile) {
        formData.append("receipt", selectedFile);
      }

      //  Call parent API handler
      await onSubmit(expense._id, formData);

      onClose();
    } catch (err: any) {
      setError(err?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-blue-900/40 backdrop-blur-md flex justify-center items-center">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl relative">

        <h2 className="text-xl font-semibold mb-4">Edit Expense</h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />

          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>

          <input
            type="date"
            name="expenseDate"
            value={form.expenseDate}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
 {/*TAG INPUT SECTION */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Add Tags
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="Enter tag name"
              className="flex-1 border rounded px-3 py-2"
            />

            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
            >
              Add
            </button>
          </div>
            {/* TAG CHIPS */}
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="w-full border px-3 py-2 rounded"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;