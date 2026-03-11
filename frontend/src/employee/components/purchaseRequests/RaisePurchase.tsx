import React, { useState } from "react";

interface Props {
  onClose: () => void;
  raisePurchase: (data: any) => void;
}

const RaisePurchase: React.FC<Props> = ({ onClose, raisePurchase }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    quantity: 1,
    estimatedCost: 0,
    currency: "INR",
    productLink: "",
    date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    raisePurchase(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[450px] shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Raise Purchase Request</h2>

        <form onSubmit={submit} className="space-y-3">
          <input
            name="title"
            placeholder="Title"
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            name="category"
            placeholder="Category"
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            name="description"
            placeholder="Description"
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            type="number"
            name="estimatedCost"
            placeholder="Estimated Cost"
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            name="currency"
            placeholder="Currency"
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            name="productLink"
            placeholder="Product Link"
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            type="date"
            name="date"
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default RaisePurchase;