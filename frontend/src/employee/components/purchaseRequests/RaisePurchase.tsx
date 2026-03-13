import React, { useState } from "react";

interface Props {
  onClose: () => void;
  raisePurchase: (data: any) => void;
  editPurchase: (id: string, data: any) => void;
  editingRequest: any;
}

const RaisePurchase: React.FC<Props> = ({
  onClose,
  raisePurchase,
  editPurchase,
  editingRequest,
}) => {

  const [form, setForm] = useState({
    title: editingRequest?.title || "",
    description: editingRequest?.description || "",
    category: editingRequest?.category || "",
    quantity: editingRequest?.quantity || 1,
    estimatedCost: editingRequest?.estimatedCost || 0,
    currency: editingRequest?.currency || "INR",
    productLink: editingRequest?.productLink || "",
    date: editingRequest?.date?.slice(0,10) || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRequest) {
      editPurchase(editingRequest._id, form);
    } else {
      raisePurchase(form);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[450px] shadow-lg relative">
        <button onClick={onClose} className="absolute top-3 right-4">
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {editingRequest ? "Edit Purchase Request" : "Raise Purchase Request"}
        </h2>

        <form onSubmit={submit} className="space-y-3">

          <input name="title" value={form.title} onChange={handleChange} className="w-full border p-2 rounded" />

          <input name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded" />

          <input name="description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded" />

          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="w-full border p-2 rounded" />

          <input type="number" name="estimatedCost" value={form.estimatedCost} onChange={handleChange} className="w-full border p-2 rounded" />

          <input name="currency" value={form.currency} onChange={handleChange} className="w-full border p-2 rounded" />

          <input name="productLink" value={form.productLink} onChange={handleChange} className="w-full border p-2 rounded" />

          <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border p-2 rounded" />

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            {editingRequest ? "Update Request" : "Submit Request"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default RaisePurchase;