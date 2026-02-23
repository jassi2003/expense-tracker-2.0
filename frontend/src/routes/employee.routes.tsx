import { Routes, Route } from "react-router-dom";
import EmployeeLayout from "@/layouts/EmployeeLayout";
import ProtectedRoute from "@/auth/ProtectedRouted";

import Dashboard from "@/employee/pages/Dashboard";
import Reports from "@/employee/pages/Reports";
import Expenses from "@/employee/pages/Expenses";

export default function EmployeeRoutes() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute allowedRole="EMPLOYEE">
            <EmployeeLayout />
          </ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/expenses" element={<Expenses />} />
      </Route>
    </Routes>
  );
}