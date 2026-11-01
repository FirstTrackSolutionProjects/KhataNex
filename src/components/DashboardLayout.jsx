import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import BottomNav from "./BottomNav";
import ErrorBoundary from "./ErrorBoundary";
import { useSidebar } from "../context/SidebarContext";

/**
 * Shared layout component for all authenticated dashboard views.
 * 
 * Responsibilities:
 * - Mounts the root authoritative Sidebar instance
 * - Renders the unified MobileHeader (hamburger, branding, Home, Profile) on mobile (< lg)
 * - Offsets desktop layout (lg:pl-64) so main content starts cleanly after the 256px sidebar
 * - Renders BottomNav for mobile quick actions
 */
export default function DashboardLayout({ children }) {
  const { setIsLayoutMounted } = useSidebar();

  useEffect(() => {
    setIsLayoutMounted(true);
    return () => {
      setIsLayoutMounted(false);
    };
  }, [setIsLayoutMounted]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Root Authoritative Sidebar */}
      <Sidebar isRootLayout={true} />

      {/* Main Layout Area - starts strictly after the sidebar on desktop */}
      <div className="dashboard-layout-content flex min-h-screen flex-col lg:pl-64">
        {/* Global Responsive Mobile Header */}
        <MobileHeader />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-20 md:pb-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
