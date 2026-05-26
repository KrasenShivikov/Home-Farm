import { router } from "expo-router";
import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

import { ApiUser, loginRequest, registerRequest } from "./api";

interface AuthContextValue {
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  token: string | null;
  user: ApiUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  setUser: (user: ApiUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  async function login(email: string, password: string) {
    setIsLoggingIn(true);
    try {
      const result = await loginRequest(email.trim(), password);
      setToken(result.token);
      setUser(result.user);
      router.replace("/orders");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function register(name: string, email: string, password: string) {
    setIsRegistering(true);
    try {
      const result = await registerRequest(name.trim(), email.trim(), password);
      setToken(result.token);
      setUser(result.user);
      router.replace("/orders");
    } finally {
      setIsRegistering(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    router.replace("/");
  }

  const value = useMemo(
    () => ({
      isLoggedIn: !!token,
      isLoggingIn,
      isRegistering,
      token,
      user,
      login,
      register,
      setUser,
      logout,
    }),
    [isLoggingIn, isRegistering, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
