import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGet } from "../../api/client";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  createdAt?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
  tokenStorageKey: string;
  meUrl: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children, tokenStorageKey, meUrl }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(tokenStorageKey));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(tokenStorageKey);
  }, [tokenStorageKey]);

  const login = useCallback(
    (newToken: string, newUser: AuthUser) => {
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem(tokenStorageKey, newToken);
    },
    [tokenStorageKey]
  );

  const refreshUser = useCallback(async () => {
    const data = await apiGet<AuthUser>(meUrl);
    setUser(data);
  }, [meUrl]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    refreshUser()
      .catch(() => logout())
      .finally(() => setIsLoading(false));
  }, [token, refreshUser, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
