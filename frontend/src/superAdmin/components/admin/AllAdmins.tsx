import React from "react"

interface Admin {
  _id: string
  userId: string
  name: string
  email: string
  role: string
  isActive: boolean
}

interface Props {
  admins: Admin[]
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  loading: boolean
}

const AllAdmins = ({
  admins,
  page,
  setPage,
  totalPages,
  loading
}: Props) => {

  return (

    <div className="bg-white shadow rounded-xl p-6">

      <h2 className="text-lg font-semibold mb-4">
        All Admins
      </h2>

      {loading ? (
        <p>Loading admins...</p>
      ) : admins.length === 0 ? (
        <p>No admins found</p>
      ) : (

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">

            <tr>
              <th className="px-4 py-3 text-left">User ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>

          </thead>

          <tbody>

            {admins.map((admin) => (

              <tr
                key={admin._id}
                className="border-t hover:bg-gray-50"
              >

                <td className="px-4 py-3">
                  {admin.userId}
                </td>

                <td className="px-4 py-3 font-medium">
                  {admin.name}
                </td>

                <td className="px-4 py-3">
                  {admin.email}
                </td>

                <td className="px-4 py-3">
                  {admin.role}
                </td>

                <td className="px-4 py-3">

                  {admin.isActive ? (
                    <span className="text-green-600 font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium">
                      Inactive
                    </span>
                  )}

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

export default AllAdmins