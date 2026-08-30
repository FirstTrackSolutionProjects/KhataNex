import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap any dashboard route: redirects to /login if not authenticated.
// Pass allowedRoles to further restrict a route to specific roles (e.g. the
// superadmin-only Dashboard page) — anyone else is sent to /customers,
// which is the normal operational dashboard's landing page.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-3 text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is trying to access a superadmin-only page but isn't superadmin,
    // redirect to customers which is the normal operational dashboard
    return <Navigate to="/customers" replace />;
  }

  return children;
};

export default ProtectedRoute;