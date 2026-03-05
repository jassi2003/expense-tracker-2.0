import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

interface ExpenseFormData {
  title: string;
  amount: number;
  currency: string;
  expenseDate: string;
}

interface Props {
  onCreated: () => void;
  onClose: () => void;
}

const CreateExpenseForm: React.FC<Props> = ({
  onCreated,
  onClose,
}) => {
  const [form, setForm] = useState<ExpenseFormData>({
    title: "",
    amount: 0,
    currency: "INR",
    expenseDate: "",
  });

  const [currencyOptions, setCurrencyOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  //  Fetch currencies once
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/currency/currencyList",
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );

        const formatted = res.data.currencies.map(
          (c: string) => ({
            value: c,
            label: c,
          })
        );

        setCurrencyOptions(formatted);
      } catch (err) {
        console.error("Failed to load currencies");
      }
    };

    fetchCurrencies();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (name === "amount") {
      const num = Number(value);
      if (num < 0) return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleCurrencyChange = (selected: any) => {
    setForm({ ...form, currency: selected?.value || "" });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddTag = () => {
    const trimmed = currentTag.trim().toLowerCase();
    if (!trimmed) return;

    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }

    setCurrentTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const validate = () => {
    const MAX_AMOUNT = 5000000;

    if (!form.title.trim()) return "Title is required";
    if (!form.expenseDate) return "Expense date is required";
    if (!selectedFile) return "Receipt file is required";

    if (!Number.isFinite(form.amount))
      return "Invalid amount";

    if (form.amount <= 0)
      return "Amount must be greater than 0";

    if (form.amount > MAX_AMOUNT)
      return "Amount exceeds allowed limit";

    if (!form.currency) return "Currency required";

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("amount", form.amount.toString());
      formData.append("currency", form.currency);
      formData.append("expenseDate", form.expenseDate);
      formData.append("tags", JSON.stringify(tags));

      if (selectedFile) {
        formData.append("receipt", selectedFile);
      }

      await axios.post(
        "http://localhost:8000/api/expenses/add-expense",
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setForm({
        title: "",
        amount: 0,
        currency: "INR",
        expenseDate: "",
      });
      setTags([]);
      setCurrentTag("");
      setSelectedFile(null);
      setError("");
      onCreated();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Failed to create expense"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 relative">
      <h2 className="text-xl font-semibold mb-4">
        Create Expense
      </h2>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      {error && (
        <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="text"
          name="amount"
          value={form.amount}
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
            setForm({ ...form, amount: num });
          }}
          inputMode="decimal"
          placeholder="Enter amount"
          className="w-full border rounded px-3 py-2"
        />

        {/* Searchable Currency Selector */}
        <Select
          options={currencyOptions}
          value={currencyOptions.find(
            (opt) => opt.value === form.currency
          )}
          onChange={handleCurrencyChange}
          isSearchable
          placeholder="Select Currency"
        />

        <input
          type="date"
          name="expenseDate"
          value={form.expenseDate}
          onChange={handleChange}
          onKeyDown={(e) => e.preventDefault()}
          className="w-full border rounded px-3 py-2"
        />

        {/* TAGS */}
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) =>
                setCurrentTag(e.target.value)
              }
              placeholder="Enter tag name"
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-800 text-white rounded"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveTag(tag)
                  }
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* FILE */}
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
        >
          {loading
            ? "Adding expense..."
            : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

export default CreateExpenseForm;