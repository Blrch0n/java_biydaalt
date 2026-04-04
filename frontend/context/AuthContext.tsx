"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/auth";
import { LoginResponse, User, UserRole } from "@/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const stored = getStoredToken();
      if (!stored) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      setToken(stored);
      try {
        const me = await api.me();
        if (!cancelled) {
          setUser(me);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearStoredToken();
        }
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restore();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email: string, password: string) {
    const payload: LoginResponse = await api.login({ email, password });
    setStoredToken(payload.token);
    setToken(payload.token);
    setUser(payload.user);
  }

  async function signup(payload: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }) {
    await api.signup(payload);
    await login(payload.email, payload.password);
  }

  function logout() {
    clearStoredToken();
    setUser(null);
    setToken(null);
    router.push("/login");
  }

  async function refreshUser() {
    const me = await api.me();
    setUser(me);
  }

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
