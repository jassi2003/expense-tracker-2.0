import axios from "axios";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

type Role = "ADMIN" | "EMPLOYEE" | null;

type AuthUser = {
  userId: string;
  email: string;
  role: Role;
    name: string;

};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  role: Role;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<Role>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getTokenExpiryTime = (jwtToken: string): number | null => {
  try {
    const [, payload] = jwtToken.split(".");

    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));

    if (typeof decoded.exp !== "number") return null;

    return decoded.exp * 1000;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
});

const [token, setToken] = useState<string | null>(() => {
  return localStorage.getItem("token");
});
  const [authLoading, setAuthLoading] = useState(true);

 useEffect(() => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (storedToken && storedUser) {
    const expiryTime = getTokenExpiryTime(storedToken);

    if (expiryTime && expiryTime <= Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } else {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }

  setAuthLoading(false);
}, []);

//HANDLE LOGOUT
 const logout = useCallback(() => {
  setUser(null);
  setToken(null);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}, []);

  useEffect(() => {
    if (!token) return;

    const expiryTime = getTokenExpiryTime(token);

    if (!expiryTime) return;

    const timeRemaining = expiryTime - Date.now();

    if (timeRemaining <= 0) {
      logout();
      return;
    }

    const timer = window.setTimeout(() => {
      logout();
    }, timeRemaining);

    return () => window.clearTimeout(timer);
  }, [token, logout]);



const login = useCallback(async (email: string, password: string) => {
  try {
    const res = await axios.post(
      "http://localhost:8000/api/user/login-user",
      {
        email: email.trim(),
        password,
      }
    );

    if (!res.data.success || !res.data.token) {
      throw new Error(res.data?.message || "Login failed");
    }

    const token = res.data.token;
    const payload = res.data.payload;

    setToken(token);
    localStorage.setItem("token", token);

    // Fetch complete user details
    const userRes = await axios.get(
      `http://localhost:8000/api/user/get-user/${payload.userId}`,
      {
        headers: { token },
      }
    );

    const fullUser = userRes.data.user;

    setUser(fullUser);
    localStorage.setItem("user", JSON.stringify(fullUser));

    return fullUser.role;

  } catch (err: any) {
    const message =
      err?.response?.data?.message ||  
      err?.message ||                 
      "Login failed";

    throw new Error(message);
  }
}, []);




  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.role ?? null,
      isAuthenticated: !!token,
      authLoading,
      login,
      logout,
       
    }),
    [user, token, authLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
