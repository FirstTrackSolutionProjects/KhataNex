import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import { CONTACT_US_SUBJECT_ENUM } from "../constants";
import sendContactUs from "../services/contact/send_contact_us.contact.service";

const Contact = () => {
  const INITIAL_FORM_STATE = {
    name: "",
    email: "",
    phone: "",
    subject: CONTACT_US_SUBJECT_ENUM.ACCOUNT_SUPPORT,
    message: "",
  }
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await sendContactUs(formData);
      setFormData(INITIAL_FORM_STATE);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      alert(error.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =========================================
          HERO SECTION
      ========================================== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600">

        {/* Background decoration */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

          <div className="max-w-3xl">

            <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Contact KHATANEX
            </span>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              We're Here to
              <span className="text-yellow-300"> Help You</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
              Have a question about KHATANEX? Need help with your
              business account? Our team is ready to help you manage
              your business more easily.
            </p>

          </div>

        </div>
      </section>

      {/* =========================================
          CONTACT INFO CARDS
      ========================================== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Phone */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Phone size={22} />
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              Call Us
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Mon - Sat, 9 AM - 6 PM
            </p>

            <a
              href="tel:+91 9040170727"
              className="mt-3 block text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              +91 9040170727
            </a>

          </div>

          {/* Email */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Mail size={22} />
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              Email Us
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Send us your questions
            </p>

            <a
              href="mailto:support@khatanex.in"
              className="mt-3 block break-all text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              support@khatanex.in
            </a>

          </div>

          {/* Location */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <MapPin size={22} />
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              Visit Us
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Our office location
            </p>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Saheed Nagar,
              <br />
              Bhubaneswar, Odisha
            </p>

          </div>

          {/* Working Hours */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Clock size={22} />
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              Working Hours
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Customer support
            </p>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Monday - Saturday
              <br />
              9:00 AM - 6:00 PM
            </p>

          </div>

        </div>

      </section>

      {/* =========================================
          CONTACT FORM + SIDEBAR
      ========================================== */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-3">

          {/* =====================================
              CONTACT FORM
          ====================================== */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:col-span-2">

            <div className="mb-7">

              <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
                Get In Touch
              </span>

              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Send Us a Message
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fill out the form below and our team will get back
                to you as soon as possible.
              </p>

            </div>

            {/* Success Message */}
            {submitted && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                <CheckCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="font-semibold text-emerald-800">
                    Message sent successfully!
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Thank you for contacting KHATANEX. We'll get
                    back to you shortly.
                  </p>
                </div>

              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name + Email */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

              </div>

              {/* Phone + Subject */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>

                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                   {
                    Object.entries(CONTACT_US_SUBJECT_ENUM).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    ))
                   }
                  </select>
                </div>

              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Write your message here..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg sm:w-auto"
              >
                <Send size={18} />
                {loading ? "Sending..." : "Send Message"}
              </button>

            </form>

          </div>

          {/* =====================================
              SUPPORT CARD
          ====================================== */}
          <div className="space-y-6">

            {/* Support */}
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-lg sm:p-8">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <MessageCircle size={24} />
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Need Quick Help?
              </h2>

              <p className="mt-3 text-sm leading-6 text-emerald-50">
                Our customer support team is ready to help you
                with your KHATANEX account and business needs.
              </p>

              <a
                href="mailto:support@khatanex.com"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                <Mail size={17} />
                Contact Support
              </a>

            </div>

            {/* FAQ Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

              <h3 className="text-lg font-bold text-slate-900">
                Frequently Asked Questions
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Looking for a quick answer? Check our FAQ section
                for common questions.
              </p>

              <a
                href="/faq"
                className="mt-5 inline-flex text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                Visit FAQ →
              </a>

            </div>

            {/* Response Time */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Clock size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Quick Response
                  </p>

                  <p className="text-xs text-slate-500">
                    We usually reply within 24 hours.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          BOTTOM CTA
      ========================================== */}
      <section className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">

          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Ready to Simplify Your Business?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Start managing your customers, payments and business
            transactions with KHATANEX today.
          </p>

          <a
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 hover:shadow-lg"
          >
            Go to Dashboard
            <ArrowUpRight size={17} />
          </a>

        </div>

      </section>

    </div>
  );
};

export default Contact;