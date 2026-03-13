import React, { useState } from "react";

interface Expense {
  _id: string;
  title: string;
  // amount: number;
  originalAmount: number;
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
    originalAmount: expense.originalAmount,
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

 const validate = () => {
     const MAX_AMOUNT = 5000000;

    if (!form.title.trim()) return "Title is required";
    if (!form.expenseDate) return "Expense date is required";
    if (!selectedFile) return "Receipt file is required";
   
 if (!Number.isFinite(form.originalAmount))
    return "Invalid amount";

  if (form.originalAmount <= 0)
    return "Amount must be greater than 0";

  if (form.originalAmount > MAX_AMOUNT)
    return "Amount exceeds allowed limit";

  if (!form.currency) return "Currency required";

  return "";
  };




  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

   const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }



    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("originalAmount", form.originalAmount.toString());
      // formData.append("currency", form.currency);
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
  type="text"
  name="amount"
   value={Number(
    (form.originalAmount as any)?.$numberDecimal ??
      form.originalAmount ??
      0
  )}
  onChange={(e) => {
    const value = e.target.value.trim();

    // Allow only numbers with max 2 decimals
    if (!/^\d*\.?\d{0,2}$/.test(value)) return;

    const num = Number(value);

    // Block NaN, Infinity, negative
    if (!Number.isFinite(num) || num < 0) return;

    // Block very large values
    const MAX_AMOUNT = 5000000;
    if (num > MAX_AMOUNT) {
      setError("Amount exceeds allowed limit");
      return;
    }

    setError("");
    setForm({ ...form, originalAmount: num });
  }}
  inputMode="decimal"
  placeholder="Enter amount"
  className="w-full border rounded px-3 py-2"
/>

      

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