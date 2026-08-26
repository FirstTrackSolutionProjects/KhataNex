import React from "react";
import { Link } from "react-router-dom";

import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import ChatBox from "./ChatBox";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300">

      {/* =========================================
          MAIN FOOTER
      ========================================== */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        {/* 5 COLUMNS */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

          {/* =====================================
              COLUMN 1 - BRAND
          ====================================== */}
          <div>

            {/* Logo + Brand */}
            <Link
              to="/"
              className="mb-5 inline-flex items-center gap-3"
            >

              {/* Logo */}
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md">
                <img
                  src="/images/Logo.jpeg"
                  alt="KHATANEX Logo"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Brand Name */}
              {/* Brand Name */}
<div>
  <h2
    className="
      text-xl font-extrabold tracking-wide
      bg-gradient-to-r
      from-emerald-400
      via-teal-300
      to-cyan-400
      bg-clip-text
      text-transparent
    "
  >
    KHATANEX
  </h2>

  <p className="text-[10px] font-medium text-emerald-400">
    Smart Khata. Simple Business.
  </p>
</div>

            </Link>

            {/* Description */}
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Manage your business transactions, customers,
              payments, invoices and accounts easily with
              KHATANEX.
            </p>

            {/* =================================
                SOCIAL MEDIA
            ================================== */}
            <div className="mt-6 flex gap-3">

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl bg-slate-900
                  text-slate-400
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:bg-blue-600
                  hover:text-white
                "
              >
                <FaFacebookF size={16} />
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl bg-slate-900
                  text-slate-400
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:bg-pink-600
                  hover:text-white
                "
              >
                <FaInstagram size={17} />
              </a>

              {/* Twitter */}
              <a
                href="#"
                aria-label="Twitter"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl bg-slate-900
                  text-slate-400
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:bg-sky-500
                  hover:text-white
                "
              >
                <FaTwitter size={16} />
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl bg-slate-900
                  text-slate-400
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:bg-blue-700
                  hover:text-white
                "
              >
                <FaLinkedinIn size={17} />
              </a>

            </div>

          </div>


          {/* =====================================
              COLUMN 2 - QUICK LINKS
          ====================================== */}
          <div>

            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm">

              <li>
                <Link
                  to="/"
                  className="group flex items-center gap-1 transition-colors hover:text-emerald-400"
                >
                  Home

                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition group-hover:opacity-100"
                  />
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="group flex items-center gap-1 transition-colors hover:text-emerald-400"
                >
                  About

                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition group-hover:opacity-100"
                  />
                </Link>
              </li>

              <li>
                <Link
                  to="/blog"
                  className="group flex items-center gap-1 transition-colors hover:text-emerald-400"
                >
                  Blog

                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition group-hover:opacity-100"
                  />
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="group flex items-center gap-1 transition-colors hover:text-emerald-400"
                >
                  Contact

                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition group-hover:opacity-100"
                  />
                </Link>
              </li>

              <li>
                <Link
                  to="/services"
                  className="group flex items-center gap-1 transition-colors hover:text-emerald-400"
                >
                  Services

                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition group-hover:opacity-100"
                  />
                </Link>
              </li>

            </ul>

          </div>


          {/* =====================================
    COLUMN 3 - FEATURES
===================================== */}
<div className="mt-8 sm:mt-0">

  <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
    Features
  </h3>

  <ul className="space-y-3 text-sm">

    <li>
      <Link
        to="/digital-khata"
        className="group flex items-center gap-1 text-slate-400 transition-colors hover:text-emerald-400"
      >
        Digital Khata

        <ArrowUpRight
          size={13}
          className="opacity-0 transition group-hover:opacity-100"
        />
      </Link>
    </li>

    <li>
      <Link
        to="/customer-management"
        className="group flex items-center gap-1 text-slate-400 transition-colors hover:text-emerald-400"
      >
        Customer Management

        <ArrowUpRight
          size={13}
          className="opacity-0 transition group-hover:opacity-100"
        />
      </Link>
    </li>

    <li>
      <Link
        to="/payments"
        className="group flex items-center gap-1 text-slate-400 transition-colors hover:text-emerald-400"
      >
        Payment Tracking

        <ArrowUpRight
          size={13}
          className="opacity-0 transition group-hover:opacity-100"
        />
      </Link>
    </li>

    <li>
      <Link
        to="/invoices"
        className="group flex items-center gap-1 text-slate-400 transition-colors hover:text-emerald-400"
      >
        Invoice Management

        <ArrowUpRight
          size={13}
          className="opacity-0 transition group-hover:opacity-100"
        />
      </Link>
    </li>

    <li>
      <Link
        to="/inventory"
        className="group flex items-center gap-1 text-slate-400 transition-colors hover:text-emerald-400"
      >
        Inventory Management

        <ArrowUpRight
          size={13}
          className="opacity-0 transition group-hover:opacity-100"
        />
      </Link>
    </li>

    <li>
      <Link
        to="/reports"
        className="group flex items-center gap-1 text-slate-400 transition-colors hover:text-emerald-400"
      >
        Business Reports

        <ArrowUpRight
          size={13}
          className="opacity-0 transition group-hover:opacity-100"
        />
      </Link>
    </li>

  </ul>

</div>


          {/* =====================================
              COLUMN 4 - CUSTOMER SERVICE
          ====================================== */}
          <div>

            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Customer Service
            </h3>

            <ul className="space-y-3 text-sm text-slate-400">

              <li>
                <Link
                  to="/faq"
                  className="transition-colors hover:text-emerald-400"
                >
                  FAQ
                </Link>
              </li>

              <li>
                <Link
                  to="/privacy-policy"
                  className="transition-colors hover:text-emerald-400"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/terms-of-use"
                  className="transition-colors hover:text-emerald-400"
                >
                  Terms Of Use
                </Link>
              </li>

              <li>
                <Link
                  to="/refund-cancellation"
                  className="transition-colors hover:text-emerald-400"
                >
                  Refund & Cancellation
                </Link>
              </li>

            </ul>

          </div>


          {/* =====================================
              COLUMN 5 - CONTACT
          ====================================== */}
          <div>

            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
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
                  Saheed Nagar,Bhubaneswar,
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
              <div className="flex items-start gap-3">

                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-500"
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
          CHATBOX
      ========================================= */}
      <div className="mt-12 border-t border-slate-800 pt-8">
        <div className="mx-auto max-w-3xl">
          <ChatBox />
        </div>
      </div>

      {/* =========================================
          BOTTOM FOOTER
      ========================================== */}
      <div className="border-t border-slate-800">

        <div
          className="
            mx-auto flex max-w-7xl
            flex-col gap-4
            px-4 py-5
            text-sm
            sm:px-6
            md:flex-row
            md:items-center
            md:justify-between
            lg:px-8
          "
        >

          {/* Copyright */}
          <p className="text-center text-slate-500 md:text-left">

            © {new Date().getFullYear()}{" "}

            <span className="font-semibold text-slate-400">
              KHATANEX
            </span>

            . All rights reserved.

          </p>


          {/* Bottom Legal Links */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 md:justify-end">

            {/* <Link
              to="/faq"
              className="text-slate-500 transition-colors hover:text-emerald-400"
            >
              FAQ
            </Link>

            <Link
              to="/privacy-policy"
              className="text-slate-500 transition-colors hover:text-emerald-400"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms-of-use"
              className="text-slate-500 transition-colors hover:text-emerald-400"
            >
              Terms Of Use
            </Link>

            <Link
              to="/refund-cancellation"
              className="text-slate-500 transition-colors hover:text-emerald-400"
            >
              Refund & Cancellation
            </Link> */}

          </div>

        </div>

      </div>
    
     
    </footer>
  );
};

export default Footer;