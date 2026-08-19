import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  CreditCard,
  FileText,
  Package,
  BarChart3,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Target,
  Eye,
  Lightbulb,
} from "lucide-react";

const About = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Digital Khata",
      description:
        "Maintain customer credit and debit records digitally without using traditional notebooks.",
    },
    {
      icon: Users,
      title: "Customer Management",
      description:
        "Manage your customers, their balances, transactions and account details from one place.",
    },
    {
      icon: CreditCard,
      title: "Payment Tracking",
      description:
        "Track received and pending payments with simple and organized transaction records.",
    },
    {
      icon: FileText,
      title: "Invoice Management",
      description:
        "Create and manage invoices while keeping your business records organized.",
    },
    {
      icon: Package,
      title: "Inventory Management",
      description:
        "Keep track of your products and inventory to manage your business more efficiently.",
    },
    {
      icon: BarChart3,
      title: "Business Reports",
      description:
        "Get useful business insights through organized reports and transaction summaries.",
    },
  ];

  const benefits = [
    "Simple and easy-to-use interface",
    "Manage customers and transactions in one place",
    "Quick access to business records",
    "Digital and organized account management",
    "Better visibility of payments and balances",
    "Designed for small and growing businesses",
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HERO SECTION
      ====================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600">

        {/* Background Decoration */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">

          <div className="mx-auto max-w-4xl text-center">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <BookOpen size={16} />
              About KHATANEX
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Simplifying Business,
              <span className="block text-yellow-300">
                One Khata at a Time
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
              KHATANEX is a smart digital business management platform
              designed to help businesses manage customers, transactions,
              payments, invoices and accounts with ease.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                Explore Dashboard
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Contact Us
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          ABOUT SECTION
      ====================================================== */}
      <section className="bg-white py-16 sm:py-20">

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">

          {/* Left Content */}
          <div>

            <span className="text-sm font-bold uppercase tracking-wider text-emerald-600">
              Who We Are
            </span>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              A smarter way to manage your business
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              KHATANEX brings essential business management tools together
              in one simple platform. Instead of maintaining multiple
              notebooks, spreadsheets or disconnected records, businesses
              can manage their daily transactions digitally.
            </p>

            <p className="mt-4 text-base leading-7 text-slate-600">
              From customer accounts and payment tracking to invoices,
              inventory and business reports, KHATANEX helps keep important
              business information organized and easy to access.
            </p>

            {/* Points */}
            <div className="mt-7 space-y-3">

              {benefits.slice(0, 4).map((benefit) => (
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

          {/* Right Card */}
          <div className="relative">

            <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-1 shadow-2xl">

              <div className="rounded-[22px] bg-white p-7 sm:p-9">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-emerald-600 shadow-lg">
                    <img
                      src="/images/Logo.jpeg"
                      alt="KHATANEX Logo"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      KHATANEX
                    </h3>

                    <p className="text-sm text-emerald-600">
                      Smart Khata. Simple Business.
                    </p>
                  </div>

                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">

                  <div className="rounded-2xl bg-emerald-50 p-5">
                    <Users
                      size={25}
                      className="text-emerald-600"
                    />

                    <p className="mt-3 text-2xl font-extrabold text-slate-900">
                      248+
                    </p>

                    <p className="text-xs text-slate-500">
                      Customers
                    </p>
                  </div>

                  <div className="rounded-2xl bg-teal-50 p-5">
                    <CreditCard
                      size={25}
                      className="text-teal-600"
                    />

                    <p className="mt-3 text-2xl font-extrabold text-slate-900">
                      1.2K+
                    </p>

                    <p className="text-xs text-slate-500">
                      Transactions
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-50 p-5">
                    <FileText
                      size={25}
                      className="text-blue-600"
                    />

                    <p className="mt-3 text-2xl font-extrabold text-slate-900">
                      500+
                    </p>

                    <p className="text-xs text-slate-500">
                      Invoices
                    </p>
                  </div>

                  <div className="rounded-2xl bg-orange-50 p-5">
                    <BarChart3
                      size={25}
                      className="text-orange-500"
                    />

                    <p className="mt-3 text-2xl font-extrabold text-slate-900">
                      24/7
                    </p>

                    <p className="text-xs text-slate-500">
                      Access
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          MISSION & VISION
      ====================================================== */}
      <section className="bg-slate-50 py-16 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <span className="text-sm font-bold uppercase tracking-wider text-emerald-600">
              Our Purpose
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Built with a clear purpose
            </h2>

            <p className="mt-4 text-slate-500">
              We want to make everyday business management easier,
              faster and more organized.
            </p>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">

            {/* Mission */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-9">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Target size={28} />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-slate-900">
                Our Mission
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                Our mission is to simplify business record management by
                providing an easy-to-use digital platform that helps
                business owners manage their customers, transactions,
                payments and financial records efficiently.
              </p>

            </div>

            {/* Vision */}
            <div className="rounded-3xl border border-teal-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-9">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
                <Eye size={28} />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-slate-900">
                Our Vision
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                Our vision is to create a reliable digital ecosystem where
                small and growing businesses can manage their daily
                operations confidently and make better business decisions.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          FEATURES
      ====================================================== */}
      <section className="bg-white py-16 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <span className="text-sm font-bold uppercase tracking-wider text-emerald-600">
              What We Offer
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Everything you need in one place
            </h2>

            <p className="mt-4 text-slate-500">
              Powerful yet simple tools to help you manage your business
              efficiently.
            </p>

          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                >

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
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

      {/* =====================================================
          WHY KHATANEX
      ====================================================== */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 py-16 sm:py-20">

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">

          {/* Left */}
          <div>

            <span className="text-sm font-bold uppercase tracking-wider text-emerald-400">
              Why KHATANEX
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Designed to make business management simpler
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              KHATANEX combines essential business tools into a single,
              easy-to-use platform so you can spend less time managing
              records and more time growing your business.
            </p>

            <div className="mt-7 space-y-4">

              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckCircle2
                      size={15}
                      className="text-emerald-400"
                    />
                  </div>

                  <span className="text-sm text-slate-300">
                    {benefit}
                  </span>
                </div>
              ))}

            </div>

          </div>

          {/* Right */}
          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <Lightbulb
                size={28}
                className="text-yellow-300"
              />

              <h3 className="mt-5 font-bold text-white">
                Simple
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Easy interface designed for everyday business use.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <ShieldCheck
                size={28}
                className="text-emerald-400"
              />

              <h3 className="mt-5 font-bold text-white">
                Organized
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Keep important business information structured.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <Smartphone
                size={28}
                className="text-blue-400"
              />

              <h3 className="mt-5 font-bold text-white">
                Accessible
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Access your business information whenever you need it.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <BarChart3
                size={28}
                className="text-orange-400"
              />

              <h3 className="mt-5 font-bold text-white">
                Insightful
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Understand your business through useful reports.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="bg-white py-16">

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">

          <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-emerald-600 shadow-lg">
            <img
              src="/images/Logo.jpeg"
              alt="KHATANEX"
              className="h-full w-full object-cover"
            />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Ready to simplify your business?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            Start managing your customers, transactions, payments and
            business records with KHATANEX.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              Get Started
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Contact Us
            </Link>

          </div>

        </div>
      </section>

    </div>
  );
};

export default About;