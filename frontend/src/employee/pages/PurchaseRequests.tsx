import React, { useEffect, useState } from "react";
import RaisePurchase from "../components/purchaseRequests/RaisePurchase";
import PurchaseRequestList from "../components/purchaseRequests/PurchaseRequestList";

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
  raisedBy?: {
    userId: string
    dept: string
  }}

const PurchaseRequests: React.FC = () => {

  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PurchaseRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token") || "";

  const fetchRequests = async () => {

    try {

      let url = `http://localhost:8000/api/purchaseRequest/myPurchaseRequest?page=${page}&limit=4`;

      if (statusFilter !== "ALL") {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url, {
        headers: { token }
      });

      const data = await res.json();

      setRequests(data.requests);
      setTotalPages(data.totalPages);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);



  const raisePurchase = async (request: Omit<PurchaseRequest, "_id" | "status">) => {

    try {

      const res = await fetch(
        "http://localhost:8000/api/purchaseRequest/raisePurchaseRequest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token
          },
          body: JSON.stringify(request)
        }
      );

      const data = await res.json();

      if (data.success) {
        setRequests((prev) => [data.request, ...prev]);
        setOpenModal(false);
      }

    } catch (error) {
      console.log(error);
    }

  };



  const deletePurchase = async (id: string) => {

    try {

      const res = await fetch(
        `http://localhost:8000/api/purchaseRequest/deletePurchaseReq/${id}`,
        {
          method: "DELETE",
          headers: { token }
        }
      );

      const data = await res.json();

      if (data.success) {
        setRequests((prev) => prev.filter((req) => req._id !== id));
      }

    } catch (error) {
      console.log(error);
    }

  };



  const editPurchase = async (id: string, payload: any) => {

    const res = await fetch(
      `http://localhost:8000/api/purchaseRequest/editPurchaseReq/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();

    if (data.success) {

      setRequests((prev) =>
        prev.map((req) => (req._id === id ? data.request : req))
      );

      setEditingRequest(null);
      setOpenModal(false);
    }

  };

  //SUBMIT THE PURCHASE REQ
  const submitPurchase = async (id: string) => {

  try {

    const res = await fetch(
      `http://localhost:8000/api/purchaseRequest/submitPurchaseReq/${id}`,
      {
        method: "PUT",
        headers: { token }
      }
    );

    const data = await res.json();

    if (data.success) {

      setRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: "SUBMITTED" } : req
        )
      );

    }

  } catch (error) {
    console.log(error);
  }

};



  const handleEditClick = (request: PurchaseRequest) => {
    setEditingRequest(request);
    setOpenModal(true);
  };



  return (

    <div className="p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between mb-6 items-center">

        <h1 className="text-2xl font-semibold">
        </h1>

        <button
          onClick={() => {
            setEditingRequest(null);
            setOpenModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Raise Request
        </button>

      </div>



      <PurchaseRequestList
        requests={requests}
          statusOptions={["ALL", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}

        page={page}
        setPage={setPage}
        totalPages={totalPages}

renderActions={(req) => (
  req.status === "DRAFT" && (

    <div className="flex gap-2">

      <button
        onClick={() => handleEditClick(req)}
        className="text-blue-600 text-sm"
      >
        Edit
      </button>

      <button
        onClick={() => deletePurchase(req._id)}
        className="text-red-600 text-sm"
      >
        Delete
      </button>

      <button
        onClick={() => submitPurchase(req._id)}
        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
      >
        Submit
      </button>

    </div>

  )
)}
      />



      {openModal && (
        <RaisePurchase
          onClose={() => setOpenModal(false)}
          raisePurchase={raisePurchase}
          editPurchase={editPurchase}
          editingRequest={editingRequest}
        />
      )}

    </div>

  );

};

export default PurchaseRequests;