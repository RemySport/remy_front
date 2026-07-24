"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { logout as apiLogout } from "@/lib/api/auth";
import { getMe, type UserInfoResponse } from "@/lib/api/user";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokenStorage";

type AuthStatus = "loading" | "authenticated" | "guest";

type AuthContextValue = {
  status: AuthStatus;
  user: UserInfoResponse | null;
  login: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserInfoResponse | null>(null);

  const clearSession = useCallback(() => {
    clearTokens();
    setUser(null);
    setStatus("guest");
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setStatus("guest");
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
      setStatus("authenticated");
    } catch {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    Promise.resolve().then(() => refreshUser());
    return () => setUnauthorizedHandler(null);
  }, [refreshUser, clearSession]);

  const login = useCallback(
    async (tokens: { accessToken: string; refreshToken: string }) => {
      setTokens(tokens.accessToken, tokens.refreshToken);
      await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      await apiLogout(refreshToken);
    } catch {
      // 만료된 토큰이라도 로컬 세션은 정리한다.
    }
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ status, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  return ctx;
}
