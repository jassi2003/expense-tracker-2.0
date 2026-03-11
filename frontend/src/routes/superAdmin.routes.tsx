import { Routes, Route } from "react-router-dom";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import ProtectedRoute from "@/auth/ProtectedRouted";

import Dashboard from "@/superAdmin/pages/Dashboard";

export default function SuperAdminRoutes() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute allowedRole="SUPERADMIN">
            <SuperAdminLayout />
          </ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}