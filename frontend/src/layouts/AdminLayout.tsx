import { Outlet } from "react-router-dom";
import Sidebar from "@/admin/components/global/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminLayout() {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const payload = JSON.parse(
          localStorage.getItem("userPayload") || "{}"
        );

        if (!payload.userId) return;

        const res = await axios.get(
          `http://localhost:8000/api/user/get-user/${payload.userId}`,
          {
            headers: { token },
          }
        );

        if (res.data.success) {
          setUserName(res.data.user.userName);
        }
      } catch (error: any) {
        console.error(
          "Failed to fetch user:",
          error.response?.data?.message
        );
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* <Header userName={userName} /> */}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}