import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeRoutes from "./routes/employee.routes";
import LoginPage from "./login/Login";
import AdminRoutes from "./routes/admin.routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Employee and admin  Routes */}
        <Route path="/employee*" element={<EmployeeRoutes />} />
        <Route path="/admin*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}