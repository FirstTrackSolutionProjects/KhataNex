import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CreditCard,
  FileText,
  BarChart3,
  Users,
  Package,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const features = [
    {
      icon: BookOpen,
      title: "Digital Khata",
      description:
        "Maintain customer credit and debit records digitally and access them anytime.",
    },
    {
      icon: Users,
      title: "Customer Management",
      description:
        "Manage all your customers, balances and transaction history from one place.",
    },
    {
      icon: CreditCard,
      title: "Payment Tracking",
      description:
        "Track received and pending payments with simple transaction management.",
    },
    {
      icon: FileText,
      title: "Smart Invoices",
      description:
        "Create professional invoices and keep your business records organized.",
    },
    {
      icon: Package,
      title: "Inventory",
      description:
        "Monitor products, stock levels and prices without complicated software.",
    },
    {
      icon: BarChart3,
      title: "Business Reports",
      description:
        "Understand your business with simple and useful reports.",
    },
  ];

  const benefits = [
    "Easy customer management",
    "Digital transaction records",
    "Payment tracking",
    "Business reports",
    "Inventory management",
    "Secure account access",
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">

        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:px-8">

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
              <CheckCircle2 size={16} />
              Simple Digital Business Management
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Manage your business
              <span className="block text-emerald-600">
                smarter with KHATANEX
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Keep your khata, customers, payments, invoices and inventory
              organized in one simple digital platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                  >
                    Go to Dashboard
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/customers"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600"
                  >
                    View Customers
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                  >
                    Get Started
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-600" />
                Secure
              </div>
              <div className="flex items-center gap-2">
                <Smartphone size={17} className="text-emerald-600" />
                Mobile Friendly
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={17} className="text-emerald-600" />
                Business Ready
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/70 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs text-slate-400">
                    BUSINESS DASHBOARD
                  </p>
                  <h3 className="mt-1 text-lg font-bold">
                    Good Morning!
                  </h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-600">
                  K
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-700">
                    To Receive
                  </p>
                  <p className="mt-2 text-xl font-bold text-emerald-700">
                    ₹84,500
                  </p>
                </div>
                <div className="rounded-2xl bg-red-50 p-4">
                  <p className="text-xs text-red-600">
                    To Pay
                  </p>
                  <p className="mt-2 text-xl font-bold text-red-600">
                    ₹32,200
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">
                    Recent Transactions
                  </h4>
                  <span className="text-xs text-emerald-600">
                    View All
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {[
                    ["Rajesh Kumar", "+₹2,500", "Credit"],
                    ["Amit Traders", "-₹1,200", "Debit"],
                    ["Sita Store", "+₹4,800", "Credit"],
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
                          {item[0].charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {item[0]}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item[2]}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          item[1].startsWith("+")
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {item[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Powerful Features
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything your business needs
            </h2>
            <p className="mt-4 text-slate-600">
              KHATANEX helps you organize daily business activities without
              complicated tools.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Why KHATANEX
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Run your business with confidence
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              From customer balances to payments and inventory, keep your
              business information organized and easy to understand.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-emerald-600"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-emerald-600 p-8 text-white shadow-xl">
            <p className="text-sm font-medium text-emerald-100">
              SMART BUSINESS MANAGEMENT
            </p>
            <h3 className="mt-4 text-3xl font-bold">
              Your business records.
              <br />
              One simple place.
            </h3>
            <p className="mt-5 leading-7 text-emerald-50">
              Start managing your customers, transactions and business
              activities digitally.
            </p>
            <Link
              to={isLoggedIn ? "/dashboard" : "/signup"}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              {isLoggedIn ? "Go to Dashboard" : "Create Account"}
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;