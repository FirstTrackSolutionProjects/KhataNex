import React, { createContext, useContext, useEffect, useState } from "react";
import api, { getToken, setToken, clearToken } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    const token = getToken();
    if (!token) {
      setSubscription(null);
      return null;
    }
    try {
      const data = await api.get("/api/subscriptions/me");
      if (data?.success) {
        const subState = {
          active: Boolean(data.activeSubscription),
          data: data.activeSubscription || null,
          remainingDays: data.remainingDays || 0,
          isIntroEligible: Boolean(data.isIntroductoryEligible),
          enforcement: data.enforcement || "off",
          orders: data.billingHistory || data.orders || [],
        };
        setSubscription(subState);
        return subState;
      }
    } catch (_) {
      // Non-blocking: fail gracefully without clearing user
    }
    return null;
  };

  const refreshUser = async () => {
    const token = getToken();
    if (!token) return null;
    try {
      const data = await api.get("/api/auth/me");
      if (data?.user) {
        setUser((prev) => {
          if (!prev) return data.user;
          const prevSig = JSON.stringify({
            role: prev.role,
            assigned_modules: prev.assigned_modules,
            permissions: prev.permissions,
            status: prev.status,
            name: prev.name,
            email: prev.email,
          });
          const nextSig = JSON.stringify({
            role: data.user.role,
            assigned_modules: data.user.assigned_modules,
            permissions: data.user.permissions,
            status: data.user.status,
            name: data.user.name,
            email: data.user.email,
          });
          return prevSig === nextSig ? prev : data.user;
        });
        return data.user;
      }
    } catch (_) {
      // Non-blocking
    }
    return null;
  };

  useEffect(() => {
    const hydrate = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get("/api/auth/me");
        setUser(data.user);
        if (data.user) {
          await refreshSubscription();
        }
      } catch (_) {
        clearToken();
        setUser(null);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  // Live permission and profile refresh: sync on window focus, tab visibility, or 15s interval
  useEffect(() => {
    if (!user) return;
    const handleActivity = () => {
      if (document.visibilityState === "visible") {
        refreshUser();
      }
    };
    window.addEventListener("focus", handleActivity);
    document.addEventListener("visibilitychange", handleActivity);
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshUser();
      }
    }, 15000);

    return () => {
      window.removeEventListener("focus", handleActivity);
      document.removeEventListener("visibilitychange", handleActivity);
      clearInterval(interval);
    };
  }, [Boolean(user)]);

  const login = async (email, password) => {
    const data = await api.post("/api/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    if (data.user) {
      await refreshSubscription();
    }
    return data.user;
  };

  const register = async (payload) => {
    const data = await api.post("/api/auth/register", payload);
    setToken(data.token);
    setUser(data.user);
    if (data.user) {
      await refreshSubscription();
    }
    return data.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setSubscription(null);
  };

  const updateProfile = async (payload) => {
    const data = await api.patch("/api/auth/me", payload);
    setUser(data.user);
    return data.user;
  };

  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptFeature, setPromptFeature] = useState("");

  const openSubscriptionPrompt = (featureName = "") => {
    setPromptFeature(featureName);
    setIsPromptOpen(true);
  };

  const closeSubscriptionPrompt = () => {
    setIsPromptOpen(false);
    setPromptFeature("");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        subscription,
        refreshSubscription,
        refreshUser,
        login,
        register,
        logout,
        updateProfile,
        setUser,
        isPromptOpen,
        promptFeature,
        openSubscriptionPrompt,
        closeSubscriptionPrompt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;
