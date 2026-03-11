
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contextApi/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.trim()) return "Email is required";
    if (!password.trim()) return "Password is required";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const v = validate();
    if (v) return setError(v);

    try {
      setLoading(true);

      const role = await login(email, password); // login returns "ADMIN" | "EMPLOYEE"

      console.log("Role from login():", role);

      if (role) {
        localStorage.setItem("role", role);
      }
      if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });

      } else if (role === "EMPLOYEE") {
        navigate("/employee/dashboard", { replace: true });
      }
      else {
        navigate("/superAdmin/dashboard", { replace: true });

      }
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Login to continue to Expense Tracker
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="emter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 py-2.5 text-white font-semibold hover:bg-sky-700 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>


        </form>
      </div>
    </div>


  );
}

