import { Routes, Route } from "react-router-dom";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import ProtectedRoute from "@/auth/ProtectedRouted";
import Admins from "@/superAdmin/pages/Admins";

import Dashboard from "@/superAdmin/pages/Organizations";

export default function SuperAdminRoutes() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute allowedRole="SUPERADMIN">
            <SuperAdminLayout />
          </ProtectedRoute>}>
        <Route path="/organization" element={<Dashboard />} />
        <Route path="/admin" element={<Admins />} />
      </Route>
    </Routes>
  );
}