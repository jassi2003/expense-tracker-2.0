import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Clock3,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contextApi/AuthContext";

type Item = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
};

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const items: Item[] = [
  { id: "dashboard", label: "Dashboard", href: "/superAdmin/dashboard", icon: <Briefcase className="h-5 w-5" /> },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();              // clear token + user
    navigate("/");    // redirect to login
  };

  const Nav = (
    <aside className="h-full w-72 border-r border-slate-200 bg-slate-50 px-4 py-4 flex flex-col">
      {/* Top Header */}
      <div className="flex items-center gap-3 px-2 pb-4 border-b border-slate-200">
        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
          ₹
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-slate-900 truncate">Expense Management</div>
          <div className="text-xs text-slate-500 truncate">Super Admin Panel</div>
        </div>
      </div>

      {/* Top Nav */}
      <nav className="flex-1">

        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  [
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition",
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")
                }
                onClick={() => onClose?.()}
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? "text-slate-800" : "text-slate-600"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>

    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">{Nav}</div>

      {/* Mobile Drawer */}
      <div className="md:hidden">
        <div
          className={[
            "fixed inset-0 z-40 bg-black/40 transition-opacity",
            isOpen ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          onClick={onClose}
        />
        <div
          className={[
            "fixed left-0 top-0 z-50 h-dvh w-72 transform transition-transform duration-200 ease-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          {Nav}
        </div>
      </div>
    </>
  );
}



