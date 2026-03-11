import { Outlet } from "react-router-dom";
import Sidebar from "@/superAdmin/components/global/Sidebar";


const SuperAdminLayout = () => {
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

export default SuperAdminLayout;
