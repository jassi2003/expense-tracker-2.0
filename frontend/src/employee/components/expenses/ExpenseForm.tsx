import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

interface ExpenseFormData {
  title: string;
  amount: number;
  currency: string;
  expenseDate: string;
}

interface ReportOption {
  value: string | null;
  label: string;
}

interface Props {
  onCreated: () => void;
  onClose: () => void;
  scanReceipt: (file: File) => Promise<any>;

}

const CreateExpenseForm: React.FC<Props> = ({
  onCreated,
  onClose,
  scanReceipt
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportOption | null>(null);
  const [scanning, setScanning] = useState(false);


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


  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/expenseReport/my-reports",
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );

        const reports = res.data.reports || [];

        const formatted = [
          { value: null, label: "No Report" },
          ...reports.map((r: any) => ({
            value: r._id,
            label: r.reportName,
          })),
        ];

        setReportOptions(formatted);
      } catch (err) {
        console.error("Failed to fetch reports");
      }
    };

    fetchReports();
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

//SCANNING RECEIPT
  const handleScanReceipt = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files?.[0]) return;

  const file = e.target.files[0];
setScanning(true);
  setSelectedFile(file);

try{
  const data = await scanReceipt(file);

  if (data) {
    setForm({
      title: data.title || "",
      amount: data.amount || 0,
      currency: data.currency || "INR",
      expenseDate: data.expenseDate
        ? data.expenseDate.split(" ")[0]
        : "",
    });
  }
}
catch (err) {
    console.error("Scan failed");
  } finally {
    setScanning(false); // STOP LOADER
  }};


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
      if (selectedReport?.value) {
        formData.append("reportId", selectedReport.value);
      }

      if (selectedFile) {
        formData.append("receipt", selectedFile);
      }

      const res = await axios.post(
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


      {scanning && (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 z-20 rounded-xl">
    
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

    <p className="mt-3 text-sm text-gray-700 font-medium">
      Scanning receipt, please wait...
    </p>

  </div>
)}

<form
  onSubmit={handleSubmit}
  className={`space-y-4 transition ${
    scanning ? "opacity-40 pointer-events-none" : ""
  }`}
>        <input
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

        <Select
          options={reportOptions}
          value={selectedReport}
          onChange={(option) => setSelectedReport(option)}
          isSearchable
          placeholder="Select Report (optional)"
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
      {/* RECEIPT OPTIONS */}

<div className="space-y-3">

  <label className="text-sm font-medium text-gray-600">
    Receipt
  </label>

  <div className="flex gap-3">

    {/* Scan Receipt */}
    <label className="flex-1 border rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50">
      📷 Scan Receipt
      <input
        type="file"
        accept="image/*"
        onChange={handleScanReceipt}
        className="hidden"
      />
    </label>

    {/* Manual Upload */}
    <label className="flex-1 border rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50">
      ⬆ Upload Receipt
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </label>

  </div>

  {selectedFile && (
    <p className="text-xs text-gray-500">
      Selected: {selectedFile.name}
    </p>
  )}

</div>

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