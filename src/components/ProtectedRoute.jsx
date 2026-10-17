import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasModuleAccess, getDefaultLandingPath } from "../utils/navigation";
import AccessDeniedNotice from "./AccessDeniedNotice";

/**
 * ProtectedRoute: Guards authenticated routes with role and granular module authorization.
 * Resolves dynamic fallback destinations to prevent recursive navigation loops and blank screens.
 */
const ProtectedRoute = ({ children, allowedRoles, requiredModule }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-3 text-sm text-slate-500">Loading KhataNex...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-level restriction
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackPath = getDefaultLandingPath(user);
    if (!fallbackPath || fallbackPath === location.pathname) {
      return (
        <AccessDeniedNotice
          title="Role Restriction"
          message={`This area is restricted to ${allowedRoles.join(", ")} accounts.`}
        />
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // Module-level restriction for employees and tenant users
  if (requiredModule) {
    const hasAccess = hasModuleAccess(user, requiredModule);
    if (!hasAccess) {
      const fallbackPath = getDefaultLandingPath(user);
      // Strictly prevent redirecting to the same route or looping
      if (!fallbackPath || fallbackPath === location.pathname) {
        return (
          <AccessDeniedNotice
            moduleName={requiredModule}
            title="Module Access Restricted"
          />
        );
      }
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;