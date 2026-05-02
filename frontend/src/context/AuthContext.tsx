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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((session: AuthSession | null) => {
    // persist only the non-sensitive user object; token is HttpOnly cookie
    writeStoredSession(session ? { ...session, token: undefined } : null);
    setUser(session?.user ?? null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const session = await getSession();
      setUser((currentUser) => {
        if (!currentUser) {
          return {
            id: session.userId,
            name: "User",
            email: "",
          };
        }

        if (currentUser.id === session.userId) {
          return currentUser;
        }

        return {
          ...currentUser,
          id: session.userId,
        };
      });
    } catch {
      persistSession(null);
    }
  }, [persistSession]);

  useEffect(() => {
    let cancelled = false;

    const initializeSession = async () => {
      const storedSession = readStoredSession();

      if (!storedSession?.user) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setUser(storedSession.user ?? null);
      }

      try {
        const session = await getSession();
        if (!cancelled) {
          setUser((currentUser) => ({
            id: session.userId,
            name: currentUser?.name || "User",
            email: currentUser?.email || "",
          }));
        }
      } catch {
        if (!cancelled) {
          persistSession(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void initializeSession();

    return () => {
      cancelled = true;
    };
  }, [persistSession]);

  useEffect(() => {
    if (loading || !user) return;

    const timeoutId = window.setTimeout(() => {
      void refreshSession();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loading, user, refreshSession]);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const response = await loginUser(payload);
      const sessionUser = normalizeAuthUser(undefined, payload.email);
      const me = await getSession();

      persistSession({
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

      // backend may set auth cookie during registration/login; persist user
      persistSession({
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
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshSession,
    }),
    [user, loading, login, register, logout, refreshSession],
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
