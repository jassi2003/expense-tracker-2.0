import { Navigate } from "react-router-dom";
import { useAuth } from "@/contextApi/AuthContext";
import type { JSX } from "react";

type Props = {
  children: JSX.Element;
  allowedRole: "ADMIN" | "EMPLOYEE" | "SUPERADMIN";
};

export default function ProtectedRoute({ children, allowedRole }: Props) {
  const { role, token, authLoading } = useAuth();

  if (authLoading) return null;

  // Not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }
  // Wrong role
  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}