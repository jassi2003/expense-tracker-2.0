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
  dept?: string;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (storedToken && storedRole) {
      setToken(storedToken);
      setUser({ role: storedRole as Role } as any);
    }

    setAuthLoading(false);
  }, []);



  //HANDLE LOGIN
  const login = useCallback(async (email: string, password: string) => {
    const res = await axios.post(
      "http://localhost:8000/api/user/login-user",
      {
        email: email.trim().toLowerCase(),
        password,
      }
    );

    if (!res.data.success || !res.data.token) {
      throw new Error(res.data?.message || "Login failed");
    }
    const jwtToken = res.data.token;
    const payload = res.data.payload;


    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);

    const loggedUser = {
      userId: payload.userId,
      role: payload.role,
      dept: payload.dept,
    };

    setUser(loggedUser as any);

    // Store only role
    localStorage.setItem("role", payload.role);
    localStorage.setItem("userId", payload.userId);
    return payload.role;
  }, []);


  //HANDLE LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setUser(null);
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
