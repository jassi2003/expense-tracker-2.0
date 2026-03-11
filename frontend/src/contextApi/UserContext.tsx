


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
