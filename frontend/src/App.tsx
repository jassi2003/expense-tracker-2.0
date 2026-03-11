import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeRoutes from "./routes/employee.routes";
import LoginPage from "./login/Login";
import AdminRoutes from "./routes/admin.routes";
import SuperAdminRoutes from "./routes/superAdmin.routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Employee and admin  Routes */}
        <Route path="/employee*" element={<EmployeeRoutes />} />
        <Route path="/admin*" element={<AdminRoutes />} />
        <Route path="/superAdmin*" element={<SuperAdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}