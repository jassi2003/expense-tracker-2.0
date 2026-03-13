import React from "react"

interface Organization {
  _id: string
  name: string
  domain: string
  industry: string
  country: string
  isActive: boolean
}

interface Props {
  organizations: Organization[]
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  loading: boolean
  toggleOrganizationStatus: (org: Organization) => void
}

const AllOrganizations = ({
  organizations,
  page,
  setPage,
  totalPages,
  loading,
  toggleOrganizationStatus
}: Props) => {

  return (
    <div className="bg-white shadow rounded-xl p-6">

      <h2 className="text-lg font-semibold mb-4">
        All Organizations
      </h2>

      {loading ? (
        <p>Loading organizations...</p>
      ) : organizations.length === 0 ? (
        <p>No organizations found</p>
      ) : (

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Organization</th>
              <th className="px-4 py-3 text-left">Domain</th>
              <th className="px-4 py-3 text-left">Industry</th>
              <th className="px-4 py-3 text-left">Country</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>

            {organizations.map((org) => (

              <tr key={org._id} className="border-t hover:bg-gray-50">

                <td className="px-4 py-3 font-medium">
                  {org.name}
                </td>

                <td className="px-4 py-3">
                  {org.domain}
                </td>

                <td className="px-4 py-3">
                  {org.industry}
                </td>

                <td className="px-4 py-3">
                  {org.country}
                </td>

                <td className="px-4 py-3">
                  {org.isActive ? (
                    <span className="text-green-600 font-medium">Active</span>
                  ) : (
                    <span className="text-red-500 font-medium">Inactive</span>
                  )}
                </td>

                <td className="px-4 py-3">

                  <button
                    onClick={() => toggleOrganizationStatus(org)}
                    className={`px-3 py-1 rounded text-white text-xs ${
                      org.isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {org.isActive ? "Deactivate" : "Activate"}
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

      {/* PAGINATION */}

      <div className="flex justify-center items-center gap-4 mt-6">

        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
        >
          Next
        </button>

      </div>

    </div>
  )
}

export default AllOrganizations