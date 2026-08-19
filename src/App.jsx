import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ===============================
// Components
// ===============================
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";

// ===============================
// Pages
// ===============================
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Khata from "./pages/Khata";
import Payments from "./pages/Payments";
import Invoices from "./pages/Invoices";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// ===============================
// Dashboard Layout
// ===============================
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Dashboard Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
};

// ===============================
// App
// ===============================
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">

        <Routes>

          {/* =====================================
              PUBLIC WEBSITE
          ===================================== */}

          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
                <Footer />
              </>
            }
          />

          {/* =====================================
              AUTHENTICATION
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
              DASHBOARD
          ===================================== */}

          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />

          {/* =====================================
              CUSTOMERS
          ===================================== */}

          <Route
            path="/customers"
            element={
              <DashboardLayout>
                <Customers />
              </DashboardLayout>
            }
          />

          <Route
            path="/customers/:id"
            element={
              <DashboardLayout>
                <CustomerDetails />
              </DashboardLayout>
            }
          />

          {/* =====================================
              KHATA
          ===================================== */}

          <Route
            path="/khata"
            element={
              <DashboardLayout>
                <Khata />
              </DashboardLayout>
            }
          />

          {/* =====================================
              PAYMENTS
          ===================================== */}

          <Route
            path="/payments"
            element={
              <DashboardLayout>
                <Payments />
              </DashboardLayout>
            }
          />

          {/* =====================================
              INVOICES
          ===================================== */}

          <Route
            path="/invoices"
            element={
              <DashboardLayout>
                <Invoices />
              </DashboardLayout>
            }
          />

          {/* =====================================
              INVENTORY
          ===================================== */}

          <Route
            path="/inventory"
            element={
              <DashboardLayout>
                <Inventory />
              </DashboardLayout>
            }
          />

          {/* =====================================
              REPORTS
          ===================================== */}

          <Route
            path="/reports"
            element={
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            }
          />

          {/* =====================================
              PROFILE
          ===================================== */}

          <Route
            path="/profile"
            element={
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            }
          />

          {/* =====================================
              SETTINGS
          ===================================== */}

          <Route
            path="/settings"
            element={
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            }
          />

          {/* =====================================
              404 PAGE
          ===================================== */}

          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
                <div className="text-center">

                  <div className="mb-6">
                    <h1 className="text-8xl font-extrabold text-blue-600">
                      404
                    </h1>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-800">
                    Page Not Found
                  </h2>

                  <p className="mt-2 text-slate-500">
                    The page you are looking for does not exist.
                  </p>

                  <a
                    href="/"
                    className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Go to Home
                  </a>

                </div>
              </div>
            }
          />

        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;