import React from "react";
import { Link } from "react-router-dom";

// Lucide icons - normal UI icons
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

// React Icons - social media icons
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300">

      {/* =========================================
          MAIN FOOTER
      ========================================== */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* =====================================
              BRAND
          ====================================== */}
          <div>

            {/* Logo */}
            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md overflow-hidden">
  <img
    src="/images/Logo.jpeg"
    className="h-full w-full object-cover"
    alt="KHATANEX Logo"
  />
</div>

              <div>
                <h2 className="text-xl font-bold tracking-wide text-white">
                  KHATANEX
                </h2>

                <p className="text-[10px] font-medium text-slate-400">
                  First Track 
                </p>
              </div>

            </div>

            {/* Description */}
            <p className="max-w-xs text-sm leading-6 text-slate-400">
              Manage your business transactions, customers,
              payments and accounts easily with KHATANEX.
            </p>

            {/* =================================
                SOCIAL MEDIA
            ================================== */}
            <div className="mt-6 flex gap-3">

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-slate-400 transition-all duration-200 hover:-translate-y-1 hover:bg-blue-600 hover:text-white"
              >
                <FaFacebookF size={16} />
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-slate-400 transition-all duration-200 hover:-translate-y-1 hover:bg-pink-600 hover:text-white"
              >
                <FaInstagram size={17} />
              </a>

              {/* Twitter */}
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-slate-400 transition-all duration-200 hover:-translate-y-1 hover:bg-sky-500 hover:text-white"
              >
                <FaTwitter size={16} />
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-slate-400 transition-all duration-200 hover:-translate-y-1 hover:bg-blue-700 hover:text-white"
              >
                <FaLinkedinIn size={17} />
              </a>

            </div>

          </div>

          {/* =====================================
              QUICK LINKS
          ====================================== */}
          <div>

            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm">

              <li>
                <Link
                  to="/"
                  className="transition-colors duration-200 hover:text-emerald-400"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard"
                  className="transition-colors duration-200 hover:text-emerald-400"
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <Link
                  to="/customers"
                  className="transition-colors duration-200 hover:text-emerald-400"
                >
                  Customers
                </Link>
              </li>

              <li>
                <Link
                  to="/khata"
                  className="transition-colors duration-200 hover:text-emerald-400"
                >
                  Khata
                </Link>
              </li>

              <li>
                <Link
                  to="/payments"
                  className="transition-colors duration-200 hover:text-emerald-400"
                >
                  Payments
                </Link>
              </li>

              <li>
                <Link
                  to="/reports"
                  className="transition-colors duration-200 hover:text-emerald-400"
                >
                  Reports
                </Link>
              </li>

            </ul>

          </div>

          {/* =====================================
              FEATURES
          ====================================== */}
          <div>

            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Features
            </h3>

            <ul className="space-y-3 text-sm text-slate-400">

              <li className="transition-colors hover:text-emerald-400">
                Digital Khata
              </li>

              <li className="transition-colors hover:text-emerald-400">
                Customer Management
              </li>

              <li className="transition-colors hover:text-emerald-400">
                Payment Tracking
              </li>

              <li className="transition-colors hover:text-emerald-400">
                Invoice Management
              </li>

              <li className="transition-colors hover:text-emerald-400">
                Business Reports
              </li>

              <li className="transition-colors hover:text-emerald-400">
                Inventory Management
              </li>

            </ul>

          </div>

          {/* =====================================
              CONTACT
          ====================================== */}
          <div>

            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Contact Us
            </h3>

            <div className="space-y-5 text-sm">

              {/* Address */}
              <div className="flex gap-3">

                <MapPin
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />

                <span className="leading-6 text-slate-400">
                  SaheedNager Bhubaneswar,
                  <br />
                  Odisha, India
                </span>

              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">

                <Phone
                  size={18}
                  className="shrink-0 text-emerald-500"
                />

                <a
                  href="tel:+919912345678"
                  className="text-slate-400 transition-colors hover:text-emerald-400"
                >
                  +91 9912345678
                </a>

              </div>

              {/* Email */}
              <div className="flex items-center gap-3">

                <Mail
                  size={18}
                  className="shrink-0 text-emerald-500"
                />

                <a
                  href="mailto:support@khatanex.com"
                  className="break-all text-slate-400 transition-colors hover:text-emerald-400"
                >
                  support@khatanex.com
                </a>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          BOTTOM FOOTER
      ========================================== */}
      <div className="border-t border-slate-800">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

          {/* Copyright */}
          <p className="text-center text-slate-500 md:text-left">
            © {new Date().getFullYear()} KHATANEX. All rights reserved.
          </p>

          {/* Legal Links */}
          <div className="flex justify-center gap-5 md:justify-end">

            <Link
              to="/privacy"
              className="transition-colors hover:text-emerald-400"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="transition-colors hover:text-emerald-400"
            >
              Terms & Conditions
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;   