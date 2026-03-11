import React, { useEffect, useState } from "react";
import RaisePurchase from "../components/purchaseRequests/RaisePurchase";
import MyPurchases from "../components/purchaseRequests/MyPurchases";

export interface PurchaseRequest {
  _id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  estimatedCost: number;
  currency: string;
  productLink: string;
  status: string;
  date: string;
}

const PurchaseRequests: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const token = localStorage.getItem("token") || "";

  const fetchRequests = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/purchaseRequest/myPurchaseRequest",
        { headers: { token } }
      );

      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const raisePurchase = async (request: Omit<PurchaseRequest, "_id" | "status">) => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/purchaseRequest/raisePurchaseRequest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token,
          },
          body: JSON.stringify(request),
        }
      );

      const data = await res.json();
      console.log("pruchsee req data",data)

      if (data.success) {
        setRequests((prev) => [data.request, ...prev]);
        setOpenModal(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-semibold">Purchase Requests</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Raise Request
        </button>
      </div>

      <MyPurchases requests={requests} />

      {openModal && (
        <RaisePurchase
          onClose={() => setOpenModal(false)}
          raisePurchase={raisePurchase}
        />
      )}
    </div>
  );
};

export default PurchaseRequests;