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
import { AuthProvider } from "./context/AuthContext";
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
import Inventory from "./pages/Inventory";
import Vehicles from "./pages/Vehicles";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// =====================================
// Dashboard Layout (NO Navbar - pages have their own header)
// =====================================
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {children}
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
    <BrowserRouter>
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
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Customers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CustomerDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/khata"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Khata />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Payments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Invoices />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Inventory />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Vehicles />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Reports />
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

          {/* =====================================
              404
          ===================================== */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;