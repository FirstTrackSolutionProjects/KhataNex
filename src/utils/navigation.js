/**
 * Navigation and role/module routing utilities for KhataNex
 */

export const MODULE_ROUTES = [
  { module: "dashboard", path: "/dashboard", label: "Dashboard" },
  { module: "customers", path: "/customers", label: "Customers" },
  { module: "khata", path: "/khata", label: "Khata" },
  { module: "invoices", path: "/invoices", label: "Invoices" },
  { module: "quotations", path: "/quotations", label: "Quotations" },
  { module: "receipts", path: "/money-receipts", label: "Money Receipts" },
  { module: "money_receipts", path: "/money-receipts", label: "Money Receipts" },
  { module: "inventory", path: "/inventory", label: "Inventory" },
  { module: "purchases", path: "/purchases", label: "Purchases" },
  { module: "payments", path: "/payments", label: "Payments" },
  { module: "vehicles", path: "/vehicles", label: "Vehicles" },
  { module: "banking", path: "/banking", label: "Banking" },
  { module: "reports", path: "/reports", label: "Reports" },
  { module: "users", path: "/my-users", label: "My Users" },
  { module: "help_centre", path: "/help-centre", label: "Help Centre" },
];

/**
 * Checks whether the given user has access to a specific module.
 */
export function hasModuleAccess(user, requiredModule) {
  if (!user) return false;
  if (!requiredModule) return true;

  // Superadmin has full access to all modules
  if (user.role === "superadmin") return true;

  // Regular tenant users have access to all business modules except platform user management
  if (user.role === "user") {
    return requiredModule !== "users";
  }

  // Employee role checks assigned_modules
  if (user.role === "employee") {
    const assigned = Array.isArray(user.assigned_modules) ? user.assigned_modules : [];

    // Global administrative bypasses
    if (assigned.includes("all") || assigned.includes("manage_all")) {
      return true;
    }

    // Direct module match
    if (assigned.includes(requiredModule)) {
      return true;
    }

    // Dashboard alias checks
    if (requiredModule === "dashboard" && (assigned.includes("reports") || assigned.includes("dashboard"))) {
      return true;
    }
    if (requiredModule === "reports" && assigned.includes("dashboard")) {
      return true;
    }

    // Explicit inheritance: If granted Inventory access, automatically receive Purchases access
    if (
      requiredModule === "purchases" &&
      (assigned.includes("purchases") || assigned.includes("inventory") || assigned.includes("stock"))
    ) {
      return true;
    }

    // Module aliases & cross-compatibilities
    if (
      requiredModule === "invoices" &&
      (assigned.includes("quotations") ||
        assigned.includes("receipts") ||
        assigned.includes("money_receipts"))
    ) {
      return true;
    }

    if (
      (requiredModule === "quotations" ||
        requiredModule === "receipts" ||
        requiredModule === "money_receipts") &&
      assigned.includes("invoices")
    ) {
      return true;
    }

    if (requiredModule === "inventory" && assigned.includes("stock")) {
      return true;
    }

    return false;
  }

  return false;
}

/**
 * Resolves the primary/default landing path for any user role.
 * Ensures employees are routed directly to their first authorized module.
 */
export function getDefaultLandingPath(user) {
  if (!user) return "/login";
  if (user.role === "superadmin") return "/dashboard";
  if (user.role === "user") return "/dashboard";

  if (user.role === "employee") {
    const assigned = Array.isArray(user.assigned_modules) ? user.assigned_modules : [];

    if (assigned.includes("all") || assigned.includes("manage_all")) {
      return "/dashboard";
    }

    // If employee has reports or dashboard assigned, land on dashboard
    if (assigned.includes("reports") || assigned.includes("dashboard")) {
      return "/dashboard";
    }

    // Return the first module the employee actually has access to
    for (const item of MODULE_ROUTES) {
      if (item.path !== "/reports" && hasModuleAccess(user, item.module)) {
        return item.path;
      }
    }

    // If no operational business module is assigned, Help Centre or Profile is safest
    return "/profile";
  }

  return "/customers";
}

/**
 * Returns list of accessible modules for the user
 */
export function getAuthorizedModules(user) {
  if (!user) return [];
  return MODULE_ROUTES.filter((item) => hasModuleAccess(user, item.module));
}
