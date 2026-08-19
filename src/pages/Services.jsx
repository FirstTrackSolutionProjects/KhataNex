import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  CreditCard,
  FileText,
  Package,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Clock,
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: BookOpen,
      title: "Digital Khata",
      description:
        "Maintain your customer credit and debit records digitally. Keep every transaction organized and accessible whenever you need it.",
      features: [
        "Create customer khata",
        "Credit & debit entries",
        "Transaction history",
        "Outstanding balance tracking",
      ],
      color: "emerald",
    },
    {
      icon: Users,
      title: "Customer Management",
      description:
        "Manage all your customers from one place and keep their contact information and transaction history organized.",
      features: [
        "Customer profiles",
        "Contact information",
        "Customer transaction history",
        "Outstanding amount tracking",
      ],
      color: "blue",
    },
    {
      icon: CreditCard,
      title: "Payment Tracking",
      description:
        "Track incoming and outgoing payments easily and maintain a clear record of your business cash flow.",
      features: [
        "Payment recording",
        "Credit tracking",
        "Debit tracking",
        "Payment history",
      ],
      color: "purple",
    },
    {
      icon: FileText,
      title: "Invoice Management",
      description:
        "Create and manage invoices for your business while keeping your billing records organized.",
      features: [
        "Create invoices",
        "Invoice history",
        "Customer billing",
        "Invoice status tracking",
      ],
      color: "orange",
    },
    {
      icon: Package,
      title: "Inventory Management",
      description:
        "Keep track of your products and stock levels so you always know what is available in your business.",
      features: [
        "Product management",
        "Stock tracking",
        "Inventory updates",
        "Low stock monitoring",
      ],
      color: "rose",
    },
    {
      icon: BarChart3,
      title: "Business Reports",
      description:
        "Understand your business performance with simple and useful reports based on your transactions.",
      features: [
        "Transaction reports",
        "Payment reports",
        "Customer reports",
        "Business insights",
      ],
      color: "cyan",
    },
  ];

  const colorClasses = {
    emerald: {
      icon: "bg-emerald-100 text-emerald-600",
      hover: "group-hover:border-emerald-300",
      check: "text-emerald-500",
    },
    blue: {
      icon: "bg-blue-100 text-blue-600",
      hover: "group-hover:border-blue-300",
      check: "text-blue-500",
    },
    purple: {
      icon: "bg-purple-100 text-purple-600",
      hover: "group-hover:border-purple-300",
      check: "text-purple-500",
    },
    orange: {
      icon: "bg-orange-100 text-orange-600",
      hover: "group-hover:border-orange-300",
      check: "text-orange-500",
    },
    rose: {
      icon: "bg-rose-100 text-rose-600",
      hover: "group-hover:border-rose-300",
      check: "text-rose-500",
    },
    cyan: {
      icon: "bg-cyan-100 text-cyan-600",
      hover: "group-hover:border-cyan-300",
      check: "text-cyan-500",
    },
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =========================================
          HERO SECTION
      ========================================== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600">

        {/* Background Decorations */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-100">
              Our Services
            </span>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Everything You Need to
              <span className="text-yellow-300"> Manage Your Business</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
              KHATANEX provides simple and powerful tools to manage
              your customers, khata, payments, invoices, inventory
              and business reports from one place.
            </p>

          </div>

        </div>
      </section>

      {/* =========================================
          INTRO
      ========================================== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-bold uppercase tracking-wider text-emerald-600">
            Simple Business Management
          </span>

          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Powerful Features. Simple Experience.
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
            Whether you run a retail shop, small business or growing
            enterprise, KHATANEX helps you keep your daily business
            activities organized.
          </p>

        </div>

      </section>

      {/* =========================================
          SERVICES GRID
      ========================================== */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {services.map((service) => {
            const Icon = service.icon;
            const colors = colorClasses[service.color];

            return (
              <div
                key={service.title}
                className={`group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${colors.hover} sm:p-7`}
              >

                {/* Icon */}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.icon}`}
                >
                  <Icon size={27} />
                </div>

                {/* Title */}
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {service.description}
                </p>

                {/* Features */}
                <div className="mt-5 space-y-3">

                  {service.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle
                        size={17}
                        className={`shrink-0 ${colors.check}`}
                      />

                      <span>{feature}</span>
                    </div>
                  ))}

                </div>

                {/* Learn More */}
                <div className="mt-6 border-t border-slate-100 pt-5">

                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 transition hover:text-emerald-700"
                  >
                    Learn More
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>

                </div>

              </div>
            );
          })}

        </div>

      </section>

      {/* =========================================
          WHY KHATANEX
      ========================================== */}
      <section className="border-y border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="grid items-center gap-10 lg:grid-cols-2">

            {/* Left */}
            <div>

              <span className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                Why KHATANEX?
              </span>

              <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Built to Make Business Management Easier
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-500 sm:text-base">
                Managing a business involves customers, payments,
                transactions, invoices and inventory. KHATANEX brings
                these activities together in one simple platform.
              </p>

              <Link
                to="/contact"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
              >
                Talk to Our Team
                <ArrowRight size={17} />
              </Link>

            </div>

            {/* Right */}
            <div className="grid gap-4 sm:grid-cols-3">

              {/* Secure */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <ShieldCheck size={23} />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  Secure
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Keep your business information organized and protected.
                </p>

              </div>

              {/* Mobile */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Smartphone size={23} />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  Easy Access
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Access your business records whenever you need them.
                </p>

              </div>

              {/* Fast */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Clock size={23} />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  Save Time
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Simplify everyday tasks and spend more time growing.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          CTA
      ========================================== */}
      <section className="bg-slate-50">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-6 py-12 text-center shadow-xl sm:px-10">

            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Ready to Simplify Your Business?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              Start managing your customers, transactions, payments
              and business records with KHATANEX.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                Go to Dashboard
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Contact Us
              </Link>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default Services;