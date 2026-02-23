import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "@/employee/components/global/Sidebar";
import AppHeader from "@/employee/components/global/Header";

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* <AppHeader /> */}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/*child routes render here */}
        </main>
      </div>
    </div>
  );
}