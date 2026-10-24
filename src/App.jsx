import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// =====================================
// Components
// =====================================
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import SubscriptionPromptModal from "./components/SubscriptionPromptModal";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
// =====================================
// Public Pages
// =====================================
import Home from "./pages/Home";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import RefundCancellation from "./pages/RefundCancellation";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import FAQ from "./pages/FAQ";
import DigitalKhata from "./pages/DigitalKhata";
import CustomerManagement from "./pages/CustomerManagement";


// =====================================
// Authentication
// =====================================
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// =====================================
// Dashboard Pages
// =====================================
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Khata from "./pages/Khata";
import Payments from "./pages/Payments";
import Invoices from "./pages/Invoices";
import Quotations from "./pages/Quotations";
import MoneyReceipts from "./pages/MoneyReceipts";
import Inventory from "./pages/Inventory";
import Purchases from "./pages/Purchases";
import Vehicles from "./pages/Vehicles";
import Reports from "./pages/Reports";
import MyUsers from "./pages/MyUsers";
import MyUserDetails from "./pages/MyUserDetails";
import MyEmployees from "./pages/MyEmployees";
import MyEmployeeDetails from "./pages/MyEmployeeDetails";
import HelpCentre from "./pages/HelpCentre";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Banking from "./pages/Banking";
import Subscription from "./pages/Subscription";
import BillingDashboard from "./pages/BillingDashboard";

// =====================================
// Global Subscription Prompt Modal
// =====================================
function GlobalSubscriptionModal() {
  const { isPromptOpen, closeSubscriptionPrompt, promptFeature } = useAuth();
  return (
    <SubscriptionPromptModal
      isOpen={isPromptOpen}
      onClose={closeSubscriptionPrompt}
      featureName={promptFeature}
    />
  );
}

// =====================================
// Role-aware Dashboard
// Superadmin sees the SaaS Owner Dashboard
// Normal users and authorized employees see the business Reports as their Dashboard
// =====================================
const RoleDashboard = () => {
  const { user } = useAuth();
  if (user?.role === "superadmin") {
    return <Dashboard />;
  }
  return <Reports isDashboardView={true} />;
};

// =====================================
// Dashboard Layout (NO Navbar - pages have their own header)
// =====================================
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Sidebar />
      <main>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  );
};

// =====================================
// Public Layout (includes Navbar for public pages)
// =====================================
const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

// =====================================
// 404 Page
// =====================================
const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-emerald-600">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-800">
          Page Not Found
        </h2>
        <p className="mt-2 text-slate-500">
          The page you are looking for does not exist.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
};

// =====================================
// App
// =====================================
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ScrollToTop />
            <Routes>

          {/* =====================================
              PUBLIC WEBSITE (has Navbar)
          ===================================== */}

          {/* Home */}
          <Route path="/" element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />

          {/* About */}
          <Route
            path="/about"
            element={
              <PublicLayout>
                <About />
              </PublicLayout>
            }
          />

          {/* Blog */}
          <Route
            path="/blog"
            element={
              <PublicLayout>
                <Blog />
              </PublicLayout>
            }
          />

          {/* Contact */}
          <Route
            path="/contact"
            element={
              <PublicLayout>
                <Contact />
              </PublicLayout>
            }
          />

          {/* Services */}
          <Route
            path="/services"
            element={
              <PublicLayout>
                <Services />
              </PublicLayout>
            }
          />

          {/* =====================================
              LEGAL & SUPPORT PAGES
          ===================================== */}

          {/* Refund & Cancellation */}
          <Route
            path="/refund-cancellation"
            element={
              <PublicLayout>
                <RefundCancellation />
              </PublicLayout>
            }
          />

          {/* Terms Of Use */}
          <Route
            path="/terms-of-use"
            element={
              <PublicLayout>
                <TermsOfUse />
              </PublicLayout>
            }
          />

          {/* Privacy Policy */}
          <Route
            path="/privacy-policy"
            element={
              <PublicLayout>
                <PrivacyPolicy />
              </PublicLayout>
            }
          />

          {/* FAQ */}
          <Route
            path="/faq"
            element={
              <PublicLayout>
                <FAQ />
              </PublicLayout>
            }
          />

          {/* =====================================
              FEATURES (marketing/demo pages)
          ===================================== */}

          {/* Digital Khata */}
          <Route
            path="/digital-khata"
            element={
              <PublicLayout>
                <DigitalKhata />
              </PublicLayout>
            }
          />

          {/* Customer Management */}
          <Route
            path="/customer-management"
            element={
              <PublicLayout>
                <CustomerManagement />
              </PublicLayout>
            }
          />

          {/* =====================================
              AUTHENTICATION (no Navbar, clean layout)
          ===================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          {/* =====================================
              DASHBOARD PAGES (NO outer Navbar - pages have their own header)
          ===================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user", "employee", "superadmin"]} requiredModule="dashboard">
                <DashboardLayout>
                  <RoleDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* =====================================
              BANKING
          ===================================== */}

          <Route
            path="/banking"
            element={
              <ProtectedRoute allowedRoles={["user", "employee", "superadmin"]} requiredModule="banking">
                <DashboardLayout>
                  <Banking />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* =====================================
              CUSTOMERS (normal operational dashboard,
              landing page for user/employee)
          ===================================== */}

          <Route
            path="/customers"
            element={
              <ProtectedRoute requiredModule="customers">
                <DashboardLayout>
                  <Customers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute requiredModule="customers">
                <DashboardLayout>
                  <CustomerDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/khata"
            element={
              <ProtectedRoute requiredModule="khata">
                <DashboardLayout>
                  <Khata />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute requiredModule="payments">
                <DashboardLayout>
                  <Payments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute requiredModule="invoices">
                <DashboardLayout>
                  <Invoices />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/quotations"
            element={
              <ProtectedRoute requiredModule="quotations">
                <DashboardLayout>
                  <Quotations />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/money-receipts"
            element={
              <ProtectedRoute requiredModule="invoices">
                <DashboardLayout>
                  <MoneyReceipts />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute requiredModule="inventory">
                <DashboardLayout>
                  <Inventory />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchases"
            element={
              <ProtectedRoute requiredModule="purchases">
                <DashboardLayout>
                  <Purchases />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicles"
            element={
              <ProtectedRoute requiredModule="vehicles">
                <DashboardLayout>
                  <Vehicles />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredModule="reports">
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-users"
            element={
              <ProtectedRoute allowedRoles={["superadmin", "employee"]} requiredModule="users">
                <DashboardLayout>
                  <MyUsers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-users/:id"
            element={
              <ProtectedRoute allowedRoles={["superadmin", "employee"]} requiredModule="users">
                <DashboardLayout>
                  <MyUserDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-employees"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <DashboardLayout>
                  <MyEmployees />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-employees/:id"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <DashboardLayout>
                  <MyEmployeeDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/help-centre"
            element={
              <ProtectedRoute allowedRoles={["user", "employee", "superadmin"]}>
                <DashboardLayout>
                  <HelpCentre />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscription"
            element={
              <ProtectedRoute allowedRoles={["user", "employee", "superadmin"]}>
                <DashboardLayout>
                  <Subscription />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <DashboardLayout>
                  <BillingDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* =====================================
              404
          ===================================== */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
        <GlobalSubscriptionModal />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;