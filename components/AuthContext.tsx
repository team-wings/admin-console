"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginAPI, verifyOTPAPI, resendOTPAPI, logoutAPI } from "@/lib/api";

type User = {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  profile_image: string | null;
  is_online: boolean;
  is_staff: boolean;
  can_create: boolean;
  can_retrieve: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isMfaPending: boolean;
  isLoading: boolean;
  pendingEmail: string | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  resendOTP: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const SESSION_TIMEOUT_MS = 60 * 60 * 1000;

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setCookie("auth_token", token);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }

    const pending = localStorage.getItem("pending_email");
    if (pending) {
      setPendingEmail(pending);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;

    let timeout: ReturnType<typeof setTimeout>;

    function resetTimer() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        logout();
      }, SESSION_TIMEOUT_MS);
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await loginAPI(email, password);
      localStorage.setItem("pending_email", email);
      setCookie("pending_email", email);
      setPendingEmail(email);
      router.push("/otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const verifyOTP = useCallback(async (otp: string) => {
    setIsLoading(true);
    setError(null);
    const email = localStorage.getItem("pending_email");
    if (!email) {
      setError("No pending login session. Please sign in again.");
      setIsLoading(false);
      router.push("/");
      return;
    }
    try {
      const res = await verifyOTPAPI(otp);
      const { access_token, refresh_token, ...userData } = res.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.removeItem("pending_email");

      setCookie("auth_token", access_token);
      removeCookie("pending_email");

      setUser(userData);
      setPendingEmail(null);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const resendOTP = useCallback(async () => {
    setError(null);
    const email = localStorage.getItem("pending_email");
    if (!email) {
      setError("No pending login session. Please sign in again.");
      return;
    }
    try {
      await resendOTPAPI(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    }
  }, []);

  const logout = useCallback(async () => {
    const refresh_token = localStorage.getItem("refresh_token");
    try {
      if (refresh_token) {
        await logoutAPI(refresh_token);
      }
    } catch {
      // Proceed with client-side cleanup even if API call fails
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("pending_email");
    removeCookie("auth_token");
    removeCookie("pending_email");
    setUser(null);
    setPendingEmail(null);
    router.push("/");
  }, [router]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isMfaPending: !!pendingEmail && !user,
        isLoading,
        pendingEmail,
        error,
        login,
        verifyOTP,
        resendOTP,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
