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
    setToken(storedToken);
    setUser(JSON.parse(storedUser));
  }

  setAuthLoading(false);
}, []);



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
      err?.response?.data?.message ||  // backend error message
      err?.message ||                 // axios fallback
      "Login failed";

    throw new Error(message);
  }
}, []);


  //HANDLE LOGOUT
 const logout = useCallback(() => {
  setUser(null);
  setToken(null);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
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
