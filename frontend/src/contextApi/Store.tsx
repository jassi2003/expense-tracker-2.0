// import React from "react";
// import { useAuth } from "./AuthContext";
// import { AdminProvider } from "./AdminContext";
// import { UserProvider } from "./UserContext";

// type Props = {
//   children: React.ReactNode;
// };

// export const Store: React.FC<Props> = ({ children }) => {
//   const { role, isAuthenticated } = useAuth();
// console.log("ROLE:", role);

//   if (!isAuthenticated) {
//     return <>{children}</>;
//   }

//   if (role === "ADMIN") {
//     return <AdminProvider>{children}</AdminProvider>;
//   }

//   return <UserProvider>{children}</UserProvider>;
// };

import { useAuth } from "./AuthContext";
import { AdminProvider } from "./AdminContext";
import { UserProvider } from "./UserContext";


type Props = {
  children: React.ReactNode;
};


export const Store: React.FC<Props> = ({ children }) => {
  const { role, isAuthenticated, authLoading } = useAuth();

  console.log("ROLE:", role);

  if (authLoading) {
    return null; //  wait until auth restored
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (role === "ADMIN") {
    return <AdminProvider>{children}</AdminProvider>;
  }

  if (role === "EMPLOYEE") {
    return <UserProvider>{children}</UserProvider>;
  }

  return <>{children}</>;
};
