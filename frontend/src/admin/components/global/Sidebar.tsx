import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Shield,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useAuth } from "@/contextApi/AuthContext";

type Item = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  hint: string;
};

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const items: Item[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    hint: "Operations hub",
  },
  {
    id: "expenses",
    label: "Expenses",
    href: "/admin/expenses",
    icon: <CreditCard className="h-5 w-5" />,
    hint: "Review queue",
  },
  {
    id: "users",
    label: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    hint: "Manage accounts",
  },
  {
    id: "department",
    label: "Department",
    href: "/admin/departments",
    icon: <Building2 className="h-5 w-5" />,
    hint: "Team structure",
  },
  {
    id: "expenseReports",
    label: "Expense Reports",
    href: "/admin/expenseReports",
    icon: <ClipboardList className="h-5 w-5" />,
    hint: "Report approvals",
  },
  {
    id: "purchaseRequests",
    label: "Purchase Requests",
    href: "/admin/purchaseRequests",
    icon: <ShoppingCart className="h-5 w-5" />,
    hint: "Procurement review",
  },
  {
    id: "report",
    label: "Analytics",
    href: "/admin/report",
    icon: <BarChart3 className="h-5 w-5" />,
    hint: "Insights and trends",
  },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayName = user?.name?.trim() || "Admin";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "A";

  const Nav = (
    <aside className="flex h-full w-80 flex-col border-r border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_45%,_#f1f5f9_100%)] px-3 py-3 text-slate-700">
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <Shield className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">Expense Management</div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
              Admin Control
            </div>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              Oversee reviews, approvals, departments, and reporting from one place.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex-1 rounded-3xl border border-slate-200 bg-white/90 p-2.5 shadow-sm">
        <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Workspace
        </div>

        <nav className="flex-1">
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    [
                      "group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")
                  }
                  onClick={() => onClose?.()}
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={[
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-slate-900",
                        ].join(" ")}
                      >
                        {item.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold">{item.label}</div>
                        <div
                          className={[
                            "truncate text-[11px]",
                            isActive ? "text-slate-300" : "text-slate-500",
                          ].join(" ")}
                        >
                          {item.hint}
                        </div>
                      </div>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-auto pt-3">
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">
              {avatarLetter}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-slate-900 capitalize">
                {displayName}
              </div>
              <div className="truncate text-[11px] text-slate-500">Administrator</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden h-full md:block">{Nav}</div>

      <div className="md:hidden">
        <div
          className={[
            "fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-sm transition-opacity",
            isOpen ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          onClick={onClose}
        />
        <div
          className={[
            "fixed left-0 top-0 z-50 h-dvh w-80 transform transition-transform duration-200 ease-out",
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
