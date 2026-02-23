// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useEffect,
//   useMemo,
// } from "react";
// import axios from "axios";

// export type Expense = {
//   _id: string;
//   title: string;
//   amount: number;
//   currency: string;
//   expenseDate: string;
//   receipt: string;
//   status: "PENDING" | "APPROVED" | "REJECTED";
//   tags: string[];
//   raisedBy: {
//     userId: string;
//     dept: string;
//   };
//   createdAt: string;
//   updatedAt: string;
// };

// type UserContextType = {
//   expenses: Expense[];
//   loading: boolean;
//   error: string | null;
//   fetchExpenses: () => Promise<void>;
//   clearExpenses: () => void;
// };

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Fetching all expenses
//   const fetchExpenses = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("Not authenticated");
//         return;
//       }

//       const res = await axios.get(
//         "http://localhost:8000/api/expenses/all-expenses",
//         {
//           headers: {
//             token: token, // matches your backend
//           },
//         }
//       );
//       console.log("get exp res",res)
//       setExpenses(res.data?.expenses || []);

//     } catch (err: any) {
//       setError(err.response?.data?.message || "Failed to fetch expenses");
//       setExpenses([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const clearExpenses = useCallback(() => {
//     setExpenses([]);
//     setError(null);
//   }, []);

//   // Auto fetch on mount
//   useEffect(() => {
//     fetchExpenses();
//   }, [fetchExpenses]);

//   const value = useMemo(
//     () => ({
//       expenses,
//       loading,
//       error,
//       fetchExpenses,
//       clearExpenses,
//     }),                         
//     [expenses, loading, error, fetchExpenses, clearExpenses]
//   );

//   return (
//     <UserContext.Provider value={value}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUserContext = () => {
//   const ctx = useContext(UserContext);
//   if (!ctx) {
//     throw new Error("useUserContext must be used inside UserProvider");
//   }
//   return ctx;
// };



import React, { createContext, useContext, useCallback, useMemo, useState } from "react";

type UserContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("token"));

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) localStorage.setItem("token", newToken);
    else localStorage.removeItem("token");
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const value = useMemo(
    () => ({
      token,
      setToken,
      logout,
    }),
    [token, setToken, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used inside UserProvider");
  return ctx;
};
