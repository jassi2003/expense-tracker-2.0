import React from "react";
import type { PurchaseRequest } from "@/employee/pages/PurchaseRequests";

interface Props {
  requests: PurchaseRequest[];

  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;

  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;

  renderActions?: (req: PurchaseRequest) => React.ReactNode;

  statusOptions: string[];

  showRequesterInfo?: boolean;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "FLAGGED":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const PurchaseRequestList: React.FC<Props> = ({
  requests,
  statusFilter,
  setStatusFilter,
  page,
  setPage,
  totalPages,
  renderActions,
  statusOptions,
  showRequesterInfo,
}) => {
  return (
    <>
      {/* FILTER */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          <label className="text-sm font-medium text-gray-600">
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="
            border border-gray-300
            rounded-lg
            px-3 py-2
            text-sm
            focus:ring-2
            focus:ring-blue-500
            focus:outline-none
            "
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* EMPTY STATE */}
      {requests.length === 0 ? (
        <div className="text-center text-gray-400 mt-16">
          No purchase requests yet
        </div>
      ) : (

        <div className="grid gap-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="
              bg-white
              border border-gray-200
              rounded-xl
              shadow-sm
              p-6
              flex justify-between
              hover:shadow-md
              transition
              "
            >
              {/* LEFT SIDE */}
              <div className="max-w-lg">

                <h3 className="font-semibold text-lg text-gray-800">
                  {req.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {req.description}
                </p>

                {showRequesterInfo && req.raisedBy && (
                  <p className="text-xs text-gray-500 mt-2">
                    Requested by{" "}
                    <span className="font-medium">
                      {req.raisedBy.userId}
                    </span>
                    {" • "}
                    Dept{" "}
                    <span className="font-medium">
                      {req.raisedBy.dept}
                    </span>
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(req.date).toLocaleDateString()}
                </p>

                <p className="text-sm font-medium text-gray-700 mt-2">
                  {req.quantity} × {req.currency} {req.estimatedCost}
                </p>

              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col items-end gap-3">

                {/* STATUS */}
                <span
                  className={`
                    text-xs
                    font-medium
                    px-3 py-1
                    rounded-full
                    ${getStatusStyle(req.status)}
                  `}
                >
                  {req.status}
                </span>

                {/* ACTIONS */}
                {renderActions && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex gap-2"
                  >
                    {renderActions(req)}
                  </div>
                )}

                {/* PRODUCT LINK */}
                {req.productLink && (
                  <a
                    href={req.productLink}
                    target="_blank"
                    className="
                    text-green-600
                    text-sm
                    font-medium
                    hover:underline
                    "
                  >
                    View Product
                  </a>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="
            px-4 py-2
            text-sm
            border border-gray-300
            rounded-md
            hover:bg-gray-100
            disabled:opacity-40
            "
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="
            px-4 py-2
            text-sm
            border border-gray-300
            rounded-md
            hover:bg-gray-100
            disabled:opacity-40
            "
          >
            Next
          </button>

        </div>
      )}
    </>
  );
};

export default PurchaseRequestList;