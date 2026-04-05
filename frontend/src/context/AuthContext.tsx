"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getSession,
  loginUser,
  normalizeAuthUser,
  registerUser,
} from "@/lib/api";
import type { AuthSession, AuthUser } from "@/lib/types";

const STORAGE_KEY = "optiflow-auth";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const session = readStoredSession();
    return session?.token ?? null;
  });
  const [user, setUser] = useState<AuthUser | null>(() => {
    const session = readStoredSession();
    return session?.user ?? null;
  });
  const [loading] = useState(false);

  const persistSession = useCallback((session: AuthSession | null) => {
    writeStoredSession(session);
    setToken(session?.token ?? null);
    setUser(session?.user ?? null);
  }, []);

  const refreshSession = useCallback(async () => {
    if (!token) return;

    try {
      const session = await getSession(token);
      setUser((currentUser) => {
        if (!currentUser) {
          return {
            id: session.userId,
            name: "User",
            email: "",
          };
        }

        return {
          ...currentUser,
          id: session.userId,
        };
      });
    } catch {
      persistSession(null);
    }
  }, [token, persistSession]);

  useEffect(() => {
    if (!token) return;

    const timeoutId = window.setTimeout(() => {
      void refreshSession();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [token, refreshSession]);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const response = await loginUser(payload);
      const sessionUser = normalizeAuthUser(undefined, payload.email);
      const me = await getSession(response.token);

      persistSession({
        token: response.token,
        user: {
          ...sessionUser,
          id: me.userId,
        },
      });
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload: { name: string; email: string; password: string }) => {
      const response = await registerUser(payload);
      const data = response.data;
      const userData = normalizeAuthUser(data, payload.email);

      persistSession({
        token: response.token,
        user: {
          ...userData,
          id: data?.id ?? data?._id ?? userData.id,
        },
      });
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    persistSession(null);
  }, [persistSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      refreshSession,
    }),
    [token, user, loading, login, register, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
