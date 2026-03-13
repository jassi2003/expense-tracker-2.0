import { useState } from "react"
import axios from "axios"

type Props = {
  refresh: () => void
}

export default function CreateOrganization({ refresh }: Props) {

  const [open, setOpen] = useState(false)

  const [orgName, setOrgName] = useState("")
  const [domain, setDomain] = useState("")
  const [industry, setIndustry] = useState("")
  const [country, setCountry] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const token = localStorage.getItem("token")

  const resetForm = () => {
    setOrgName("")
    setDomain("")
    setIndustry("")
    setCountry("")
  }

  const closeModal = () => {
    setOpen(false)
    setMessage("")
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    if (!orgName || !domain || !industry || !country) {
      setMessage("Please fill all fields")
      return
    }

    try {

      setLoading(true)
      setMessage("Creating organization...")

      await axios.post(
        "http://localhost:8000/api/superAdmin/create-organization",
        {
          orgName,
          domain,
          industry,
          country
        },
        {
          headers: { token }
        }
      )

      setMessage("Organization created successfully")

      resetForm()

      // refresh organizations list
      refresh()

      setTimeout(() => {
        closeModal()
      }, 1200)

    } catch (err: any) {

      setMessage(
        err?.response?.data?.message || "Failed to create organization"
      )

    } finally {

      setLoading(false)

    }

  }

  return (
    <div>

      {/* CREATE BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Create Organization
      </button>

      {/* MODAL */}
      {open && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 relative">

            {/* CLOSE BUTTON */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Create Organization
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ORG NAME */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Organization Name
                </label>

                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="border p-2 rounded"
                  placeholder="Cognizant"
                />
              </div>

              {/* DOMAIN */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Domain
                </label>

                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="border p-2 rounded"
                  placeholder="www.cognizant.com"
                />
              </div>

              {/* INDUSTRY */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Industry
                </label>

                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="border p-2 rounded"
                  placeholder="IT Services"
                />
              </div>

              {/* COUNTRY */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Country
                </label>

                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="border p-2 rounded"
                  placeholder="India"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Organization"}
              </button>

              {/* MESSAGE */}
              {message && (
                <p className="text-sm text-gray-600 text-center">
                  {message}
                </p>
              )}

            </form>

          </div>

        </div>

      )}

    </div>
  )
}