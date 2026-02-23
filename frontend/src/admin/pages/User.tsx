import { useEffect, useState } from "react";
import axios from "axios";
import AddUser from "../components/users/AddUsers";
import AllUsersTable from "../components/users/AllUsers";

export type AddEmployeePayload = {
  userId: string;
  name: string;
  empdepartment: string;
  password: string;
  email: string;
};

export type UserRow = {
  _id: string;
  userId: string;
  name: string;
  email: string;
  empdepartment: string;
  role: "ADMIN" | "EMPLOYEE";
  isActive: boolean;
};

export type DepartmentOption = {
  _id: string;
  departmentName: string;
  isActive?: boolean;
};


const PAGE_SIZE = 6;

const Users = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token = localStorage.getItem("token") || "";

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
    const [deptLoading, setDeptLoading] = useState(false);

  //  Fetch paginated users
  const fetchAllUsers = async (pageToFetch = page) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.get(
        "http://localhost:8000/api/user/get-AllUsers",
        {
          headers: { token },
          params: { page: pageToFetch, limit: PAGE_SIZE },
        }
      );

      const list = res.data?.users || [];
      const pg = res.data?.pagination;

      const normalized: UserRow[] = Array.isArray(list)
        ? list.map((u: any) => ({
            _id: u._id,
            userId: u.userId,
            name: u.name,
            email: u.email,
            empdepartment: u.empdepartment,
            role: u.role,
            isActive: u.isActive ?? true,
          }))
        : [];

      setUsers(normalized);

      // Update pagination info from backend
      if (pg?.totalPages) setTotalPages(pg.totalPages);
      if (pg?.currentPage) setPage(pg.currentPage);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  //  Add User API
  const handleAddUser = async (data: AddEmployeePayload) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/user/add-user",
        data,
        { headers: { token } }
      );
      

      // after add: refresh current page (or go to page 1 if you prefer)
      await fetchAllUsers(page);

      return res.data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add employee";
      throw new Error(msg);
    }
  };

  //  Deactivate User API
  const deactivateUser = async (mongoId: string) => {
    await axios.put(
      `http://localhost:8000/api/user/deactivate-user/${mongoId}`,
      {},
      { headers: { token } }
    );
    await fetchAllUsers(page);
  };

  // Reactivate User API
  const activateUser = async (mongoId: string) => {
    await axios.put(
      `http://localhost:8000/api/user/activate-user/${mongoId}`,
      {},
      { headers: { token } }
    );
    await fetchAllUsers(page);
  };

   // Fetch Departments
  const fetchDepartments = async () => {
    setDeptLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8000/api/departments/get-department",
        {
          headers: { token },
        }
      );

      // handle possible shapes: {departments:[]} OR {data:[]} OR []
      const list = res.data?.departments || res.data?.data || res.data;

      const normalized: DepartmentOption[] = Array.isArray(list)
        ? list.map((d: any) => ({
            _id: d._id,
            departmentName: d.departmentName,
            isActive: d.isActive ?? true,
          }))
        : [];

      // optional: only show active departments
      setDepartments(normalized.filter((d) => d.isActive !== false));
    } catch (err) {
      console.error("Failed to fetch departments");
      setDepartments([]);
    } finally {
      setDeptLoading(false);
    }
  };




  // Load first page
  useEffect(() => {
    fetchAllUsers(1);
        fetchDepartments();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goPrev = () => {
    if (page > 1) fetchAllUsers(page - 1);
  };

  const goNext = () => {
    if (page < totalPages) fetchAllUsers(page + 1);
  };




  return (
    <div className="p-6 space-y-6">
  <AddUser
        onAddUser={handleAddUser}
        departments={departments}
        departmentsLoading={deptLoading}
        onRefreshDepartments={fetchDepartments}
      />      

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">All Users</h2>
            <p className="text-sm text-slate-500">
              Showing {PAGE_SIZE} users per page
            </p>
          </div>

          <button
            onClick={() => fetchAllUsers(page)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="rounded-xl border bg-slate-50 p-4 text-slate-600">
            Loading users...
          </div>
        )}

        {!loading && errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && (
          <>
            <AllUsersTable
              users={users}
              onDeactivate={deactivateUser}
              onActivate={activateUser}
            />

            {/*Pagination controls */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={page <= 1 || loading}
                className="px-4 py-2 rounded-xl border hover:bg-slate-50 disabled:opacity-50"
              >
                ← Prev
              </button>

              <div className="text-sm text-slate-600">
                Page <span className="font-semibold text-slate-900">{page}</span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {totalPages}
                </span>
              </div>

              <button
                onClick={goNext}
                disabled={page >= totalPages || loading}
                className="px-4 py-2 rounded-xl border hover:bg-slate-50 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Users;








