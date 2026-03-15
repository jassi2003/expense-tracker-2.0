import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  Sparkles,
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
    href: "/employee/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    hint: "Overview",
  },
  {
    id: "expenses",
    label: "Expenses",
    href: "/employee/expenses",
    icon: <CreditCard className="h-5 w-5" />,
    hint: "Track spend",
  },
  {
    id: "expenseReport",
    label: "Make a Report",
    href: "/employee/expenseReport",
    icon: <ClipboardCheck className="h-5 w-5" />,
    hint: "Group claims",
  },
  {
    id: "purchaseRequests",
    label: "Purchase Requests",
    href: "/employee/purchaseRequests",
    icon: <ShoppingCart className="h-5 w-5" />,
    hint: "Request items",
  },
  {
    id: "reports",
    label: "Reports",
    href: "/employee/reports",
    icon: <BriefcaseBusiness className="h-5 w-5" />,
    hint: "View analytics",
  },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayName = user?.name?.trim() || "Employee";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "E";

  const Nav = (
    <aside className="flex h-full w-80 flex-col  border-r border-slate-200 bg-[linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_50%,_#f1f5f9_100%)] px-4 py-4">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-slate-900">Expense Management</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-sky-700">
              Employee Workspace
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Create expenses, build reports, and keep approvals moving.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-sm">
        <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Navigation
        </div>

        <nav className="flex h-full flex-col">
          <ul className="flex flex-1 flex-col justify-evenly gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    [
                      "group flex w-full items-center gap-3 rounded-2xl px-3 py-4 text-sm transition",
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
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition",
                          isActive
                            ? "bg-white/12 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-slate-900",
                        ].join(" ")}
                      >
                        {item.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-semibold">{item.label}</div>
                        <div
                          className={[
                            "truncate text-[13px]",
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

      {/* <div className="mt-4 rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,_rgba(14,165,233,0.10),_rgba(255,255,255,0.92)_55%,_rgba(248,250,252,0.98)_100%)] p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Quick Note
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Keep drafts tidy and submit reports only after receipts and tags are complete.
        </p>
      </div> */}

      <div className="relative mt-auto pt-4">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm transition hover:bg-white"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
              {avatarLetter}
            </div>

            <div className="min-w-0 text-left">
              <div className="truncate text-sm font-semibold text-slate-900 capitalize">
                {displayName}
              </div>
              <div className="truncate text-xs text-slate-500">Employee account</div>
            </div>
          </div>

          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute bottom-20 left-0 right-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden md:block">{Nav}</div>

      <div className="md:hidden">
        <div
          className={[
            "fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity",
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
