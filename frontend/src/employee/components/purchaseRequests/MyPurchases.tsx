import React from "react";

import type { PurchaseRequest } from "@/employee/pages/PurchaseRequests";


interface Props {
  requests: PurchaseRequest[];
}

const MyPurchases: React.FC<Props> = ({ requests }) => {
  if (!requests.length)
    return (
      <div className="text-center text-gray-400 mt-10">
        No purchase requests yet
      </div>
    );

  return (
    <div className="grid gap-4">
      {requests.map((req) => (
        <div
          key={req._id}
          className="bg-white shadow-sm border rounded-xl p-5 flex justify-between"
        >
          <div>
            <h3 className="font-semibold text-lg">{req.title}</h3>
            <p className="text-sm text-gray-500">{req.description}</p>

            <p className="text-xs text-gray-400 mt-1">
              {new Date(req.date).toLocaleDateString()}
            </p>

            <p className="text-sm mt-1">
              {req.quantity} × {req.currency} {req.estimatedCost}
            </p>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
              {req.status}
            </span>

            {req.productLink && (
              <div className="mt-2">
                <a
                  href={req.productLink}
                  target="_blank"
                  className="text-blue-600 text-sm"
                >
                  View Product
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyPurchases;