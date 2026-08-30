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
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/customers" replace />;
  }

  return children;
};

export default ProtectedRoute;
