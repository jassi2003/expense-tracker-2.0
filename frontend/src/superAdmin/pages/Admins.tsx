import React, { useState,useEffect } from "react"
import axios from "axios"
import AddAdmin from "../components/admin/AddAdmin"
import AllAdmins from "../components/admin/AllAdmins"

export interface Organization {
  _id: string
  name: string
}

export interface Admin {
  _id: string
  userId: string
  name: string
  email: string
  role: string
  isActive: boolean
  organization: Organization
  // Add other fields as needed
}

const Admins = () => {

  const token = localStorage.getItem("token")

  const [open, setOpen] = useState(false)
    const [admins, setAdmins] = useState<Admin[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)


  const createAdmin = async (data: any) => {

    try {

      await axios.post(
        "http://localhost:8000/api/superAdmin/create-admin",
        data,
        { headers: { token } }
      )

      alert("Admin created successfully")
      setOpen(false)

    } catch (error) {

      console.error("Failed to create admin", error)

    }
  }


  const fetchAdmins = async () => {

    try {

      setLoading(true)

      const res = await axios.get(
        "http://localhost:8000/api/superAdmin/get-admin",
        {
          headers: { token },
          params: {
            page,
            limit: 5
          }
        }
      )

      setAdmins(res.data.admins)
      setTotalPages(res.data.totalPages)

    } catch (error) {

      console.error("Failed to fetch admins", error)

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {
    fetchAdmins()
  }, [page])

  return (
    <div className="p-8">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-xl font-semibold">Organization Admins</h1>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Admin
        </button>

      </div>

      {open && (
        <AddAdmin
          onClose={() => setOpen(false)}
          onSubmit={createAdmin}
        />
      )}

      <AllAdmins
        admins={admins}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        loading={loading}
      />

    </div>
  )
}

export default Admins