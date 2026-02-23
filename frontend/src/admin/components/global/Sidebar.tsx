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
  { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: <Briefcase className="h-5 w-5" /> },
  { id: "expenses", label: "Expenses", href: "/admin/expenses", icon: <ShoppingBag className="h-5 w-5" /> },
  { id: "users", label: "Users", href: "/admin/users", icon: <Clock3 className="h-5 w-5" /> },
  { id: "department", label: "Department", href: "/admin/departments", icon: <ShoppingBag className="h-5 w-5" /> },
  { id: "report", label: "Report", href: "/admin/report", icon: <ShoppingBag className="h-5 w-5" /> },
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
          <div className="text-xs text-slate-500 truncate">Admin Panel</div>
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



// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { Briefcase, Clock3, ShoppingBag, LogOut, MoreVertical } from "lucide-react";
// import { useAuth } from "@/contextApi/AuthContext";

// type Item = {
//   id: string;
//   label: string;
//   href: string;
//   icon: React.ReactNode;
// };

// type SidebarProps = {
//   isOpen?: boolean;
//   onClose?: () => void;
// };

// const items: Item[] = [
//   { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: <Briefcase className="h-5 w-5" /> },
//   { id: "expenses", label: "Expenses", href: "/admin/expenses", icon: <ShoppingBag className="h-5 w-5" /> },
//   { id: "users", label: "Users", href: "/admin/users", icon: <Clock3 className="h-5 w-5" /> },
//   { id: "department", label: "Department", href: "/admin/departments", icon: <ShoppingBag className="h-5 w-5" /> },
//   { id: "report", label: "Report", href: "/admin/report", icon: <ShoppingBag className="h-5 w-5" /> },
// ];

// type ApiUser = {
//   name?: string;
//   userId?: string;
//   email?: string;
//   role?: string;
// };

// export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
//   // ✅ hooks must be INSIDE component
//   const { logout, token } = useAuth();
//   const navigate = useNavigate();

//   const [user, setUser] = useState<ApiUser | null>(null);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef<HTMLDivElement | null>(null);

//   const USER_ID = localStorage.getItem("userId"); // ✅ fixed

//   const displayName = useMemo(() => user?.name?.trim() || "User", [user]);
//   const avatarLetter = useMemo(() => (displayName[0] || "U").toUpperCase(), [displayName]);

//   const handleLogout = () => {
//     setMenuOpen(false);

//     // ✅ Make sure you clear any extra storage keys too
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     localStorage.removeItem("userId");

//     logout(); // should clear context state
//     navigate("/", { replace: true }); // go to login
//   };

//   // ✅ Fetch logged-in user
//   useEffect(() => {
//     if (!USER_ID) return;

//     let mounted = true;

//     (async () => {
//       try {
//         const res = await fetch(`http://localhost:8000/api/user/get-user/${USER_ID}`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}), // ✅ recommended
//           },
//         });

//         if (!res.ok) throw new Error(`Failed: ${res.status}`);

//         const data = await res.json();
//         const maybeUser = data?.user ?? data?.data ?? data;

//         if (mounted) setUser(maybeUser);
//       } catch {
//         if (mounted) setUser(null);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [token, USER_ID]);

//   // ✅ Close dropdown when clicking outside
//   useEffect(() => {
//     function onDocClick(e: MouseEvent) {
//       if (!menuOpen) return;
//       const target = e.target as Node;
//       if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
//     }
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, [menuOpen]);

//   const Nav = (
//     <aside className="h-full w-72 border-r border-slate-200 bg-slate-50 px-4 py-4 flex flex-col">
//       {/* ✅ Top Header */}
//       <div className="flex items-center gap-3 px-2 pb-4 border-b border-slate-200">
//         <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
//           ₹
//         </div>
//         <div className="min-w-0">
//           <div className="text-[15px] font-semibold text-slate-900 truncate">Expense Management</div>
//           <div className="text-xs text-slate-500 truncate">Admin Panel</div>
//         </div>
//       </div>

//       {/* ✅ Top Nav */}
//       <nav className="flex-1 pt-4">
//         <ul className="space-y-1.5">
//           {items.map((item) => (
//             <li key={item.id}>
//               <NavLink
//                 to={item.href}
//                 className={({ isActive }) =>
//                   [
//                     "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition",
//                     isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
//                   ].join(" ")
//                 }
//                 onClick={() => onClose?.()}
//               >
//                 {({ isActive }) => (
//                   <>
//                     <span className={isActive ? "text-slate-800" : "text-slate-600"}>{item.icon}</span>
//                     <span className="truncate">{item.label}</span>
//                   </>
//                 )}
//               </NavLink>
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* ✅ Bottom User Area */}
//       <div className="pt-4 border-t border-slate-200">
//         <div className="flex items-center justify-between gap-3 px-2">
//           <div className="flex items-center gap-3 min-w-0">
//             <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-semibold">
//               {avatarLetter}
//             </div>
//             <div className="min-w-0">
//               <div className="text-sm font-semibold text-slate-900 truncate">{displayName}</div>
//               <div className="text-xs text-slate-500 truncate">{user?.role || "Logged in"}</div>
//             </div>
//           </div>

//           <div className="relative" ref={menuRef}>
//             <button
//               type="button"
//               onClick={() => setMenuOpen((v) => !v)}
//               className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-600"
//               aria-label="User menu"
//             >
//               <MoreVertical className="h-5 w-5" />
//             </button>

//             {menuOpen && (
//               <div className="absolute right-0 bottom-12 w-44 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
//                 <button
//                   type="button"
//                   onClick={handleLogout}
//                   className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600"
//                 >
//                   <LogOut className="h-4 w-4" />
//                   Logout
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </aside>
//   );

//   return (
//     <>
//       <div className="hidden md:block">{Nav}</div>

//       <div className="md:hidden">
//         <div
//           className={[
//             "fixed inset-0 z-40 bg-black/40 transition-opacity",
//             isOpen ? "opacity-100" : "pointer-events-none opacity-0",
//           ].join(" ")}
//           onClick={onClose}
//         />
//         <div
//           className={[
//             "fixed left-0 top-0 z-50 h-dvh w-72 transform transition-transform duration-200 ease-out",
//             isOpen ? "translate-x-0" : "-translate-x-full",
//           ].join(" ")}
//           role="dialog"
//           aria-modal="true"
//         >
//           {Nav}
//         </div>
//       </div>
//     </>
//   );
// }