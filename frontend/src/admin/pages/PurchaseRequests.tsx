import React, { useEffect, useState } from "react";
import PurchaseRequestList from "@/employee/components/purchaseRequests/PurchaseRequestList";

interface PurchaseRequest {
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

  raisedBy: {
    userId: string;
    dept: string;
  };
}

const PurchaseRequests: React.FC = () => {

  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token") || "";



  const fetchRequests = async () => {

    try {

      let url = `http://localhost:8000/api/purchaseRequest/allPurchaseReq?page=${page}&limit=6`;


      if (statusFilter !== "ALL") {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url, {
        headers: { token }
      });

      const data = await res.json();

      setRequests(data.requests || []);
      setTotalPages(data.totalPages || 1);

    } catch (error) {
      console.log(error);
    }

  };



  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);



  const approveRequest = async (id: string) => {

    try {

      const res = await fetch(
        `http://localhost:8000/api/purchaseRequest/approvePurchaseReq/${id}`,
        {
          method: "PUT",
          headers: { token }
        }
      );

      const data = await res.json();

      if (data.success) {
        fetchRequests();   // refetch current page
      }

    } catch (error) {
      console.log(error);
    }

  };



  const rejectRequest = async (id: string) => {

    try {

      const res = await fetch(
        `http://localhost:8000/api/purchaseRequest/rejectPurchaseReq/${id}`,
        {
          method: "PUT",
          headers: { token }
        }
      );

      const data = await res.json();

      if (data.success) {
        fetchRequests();   // refetch current page
      }

    } catch (error) {
      console.log(error);
    }

  };



  return (

    <div className="p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-semibold">
            Purchase Requests
          </h1>

          <p className="text-gray-500 text-sm">
            Review and approve employee purchase requests
          </p>
        </div>

      </div>



      <PurchaseRequestList
        requests={requests}
        statusOptions={["ALL", "SUBMITTED", "APPROVED", "REJECTED"]}
        showRequesterInfo={true}
        statusFilter={statusFilter}
        setStatusFilter={(value) => {
          setStatusFilter(value);
          setPage(1); // reset page on filter change
        }}

        page={page}
        setPage={setPage}
        totalPages={totalPages}

        renderActions={(req) => (

          req.status === "SUBMITTED" && (

            <div className="flex gap-2">

              <button
                onClick={() => approveRequest(req._id)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
              >
                Approve
              </button>

              <button
                onClick={() => rejectRequest(req._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
              >
                Reject
              </button>

            </div>

          )

        )}
      />

    </div>

  );

};

export default PurchaseRequests;
