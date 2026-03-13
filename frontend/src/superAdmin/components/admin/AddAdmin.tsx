import React, { useEffect, useState } from "react"
import axios from "axios"

interface Organization {
  _id: string
  name: string
}

interface Props {
  onClose: () => void
  onSubmit: (data: any) => void
}

const AddAdmin = ({ onClose, onSubmit }: Props) => {

  const token = localStorage.getItem("token")

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [search, setSearch] = useState("")
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

  const [form, setForm] = useState({
    userId: "",
    name: "",
    email: "",
    password: ""
  })

  useEffect(() => {

    const fetchOrganizations = async () => {

      try {

        const res = await axios.get(
          "http://localhost:8000/api/superAdmin/get-organizations",
          { headers: { token } }
        )

        setOrganizations(res.data.organizations)

      } catch (error) {

        console.error("Failed to fetch organizations", error)

      }

    }

    fetchOrganizations()

  }, [])

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault()

    if (!selectedOrg) {
      alert("Please select organization")
      return
    }

    onSubmit({
      ...form,
      organizationId: selectedOrg._id
    })
  }

  return (

    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">

      <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">

        <h2 className="text-lg font-semibold">
          Create Admin
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            type="text"
            placeholder="User ID"
            className="w-full border p-2 rounded"
            value={form.userId}
            onChange={(e) =>
              setForm({ ...form, userId: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Name"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          {/* ORGANIZATION SEARCH SELECT */}

          <div>

            <input
              type="text"
              placeholder="Search organization..."
              className="w-full border p-2 rounded"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="border mt-1 max-h-40 overflow-y-auto rounded">

              {filteredOrganizations.map((org) => (

                <div
                  key={org._id}
                  onClick={() => {
                    setSelectedOrg(org)
                    setSearch(org.name)
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {org.name}
                </div>

              ))}

            </div>

          </div>

          {selectedOrg && (
            <p className="text-sm text-green-600">
              Selected: {selectedOrg.name}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Create Admin
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default AddAdmin