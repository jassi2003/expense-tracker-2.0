import { useEffect, useState } from "react"
import axios from "axios"
import AllOrganizations from "../components/organizations/AllOrganizations"
import CreateOrganizations from "../components/organizations/CreateOrganizations"

interface Organization {
  _id: string
  name: string
  domain: string
  industry: string
  country: string
  isActive: boolean
}

export default function SuperAdminPage() {

  const token = localStorage.getItem("token")

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchOrganizations = async () => {
    try {

      setLoading(true)

      const res = await axios.get(
        "http://localhost:8000/api/superAdmin/get-organizations",
        {
          headers: { token },
          params: {
            page,
            limit: 5
          }
        }
      )

      setOrganizations(res.data.organizations)
      setTotalPages(res.data.totalPages)

    } catch (err) {

      console.error("Failed to fetch organizations", err)

    } finally {

      setLoading(false)

    }
  }

  // ACTIVATE / DEACTIVATE ORGANIZATION
  const toggleOrganizationStatus = async (org: Organization) => {

    try {

      if (org.isActive) {

        await axios.put(
          `http://localhost:8000/api/superAdmin/deactivate-organization/${org._id}`,
          {},
          { headers: { token } }
        )

      } else {

        await axios.put(
          `http://localhost:8000/api/superAdmin/activate-organization/${org._id}`,
          {},
          { headers: { token } }
        )

      }

      fetchOrganizations()

    } catch (error) {

      console.error("Failed to update organization status", error)

    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [page])

  return (
    <div className="p-8 space-y-8">

      <CreateOrganizations refresh={fetchOrganizations} />

      <AllOrganizations
        organizations={organizations}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        loading={loading}
        toggleOrganizationStatus={toggleOrganizationStatus}
      />

    </div>
  )
}