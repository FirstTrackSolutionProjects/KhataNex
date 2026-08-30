import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Package,
  BarChart3,
  User,
  Settings,
  Truck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BottomNav = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const isSuperadmin = user?.role === "superadmin";

  if (!isLoggedIn) return null;

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    ...(isSuperadmin ? [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }] : []),
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Khata", path: "/khata", icon: BookOpen },
    { name: "Invoices", path: "/invoices", icon: FileText },
    { name: "Payments", path: "/payments", icon: CreditCard },
    { name: "Inventory", path: "/inventory", icon: Package },
    { name: "Vehicles", path: "/vehicles", icon: Truck },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-white border-t border-slate-200 shadow-lg md:hidden">
      <div className="flex overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[48px] px-1.5 py-1.5 text-[9px] font-medium transition-colors duration-200 flex-1 ${
                  isActive
                    ? "text-emerald-600 border-t-2 border-emerald-600"
                    : "text-slate-500 hover:text-emerald-500"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="mt-0.5 truncate max-w-[48px]">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;