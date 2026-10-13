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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        subscription,
        refreshSubscription,
        login,
        register,
        logout,
        updateProfile,
        setUser,
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
