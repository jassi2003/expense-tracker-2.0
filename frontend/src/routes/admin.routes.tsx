import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/auth/ProtectedRouted";
import AdminLayout from "@/layouts/AdminLayout";
import Dashboard from "@/admin/pages/Dashboard";
import Departments from "@/admin/pages/Departments";
import  User from "@/admin/pages/User";
import Report from "@/admin/pages/Report";
import Expenses from "@/admin/pages/Expenses";
import PurchaseRequests from "@/admin/pages/PurchaseRequests";


export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<User />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/report" element={<Report />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/purchaseRequests" element={<PurchaseRequests />} />

      </Route>
    </Routes>
  );
}