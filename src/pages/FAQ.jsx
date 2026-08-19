import React, { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Users,
  FileText,
  Package,
  BarChart3,
} from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is Khata Nex?",
      answer:
        "Khata Nex is a digital business management platform that helps shopkeepers and small businesses manage customers, track credit and payments, create invoices, manage inventory, and monitor business performance digitally.",
      icon: HelpCircle,
    },
    {
      question: "How does Digital Khata work?",
      answer:
        "Digital Khata allows you to maintain customer credit and payment records digitally. You can add transactions, record payments, check outstanding balances, and view complete customer transaction history.",
      icon: FileText,
    },
    {
      question: "Can I manage my customers with Khata Nex?",
      answer:
        "Yes. Khata Nex allows you to add customers, manage their information, view transaction history, check outstanding balances, and keep all customer records organized in one place.",
      icon: Users,
    },
    {
      question: "Can I track customer payments?",
      answer:
        "Yes. You can record received payments, track pending amounts, monitor credit transactions, and easily check which customers have outstanding balances.",
      icon: CreditCard,
    },
    {
      question: "Can I create invoices?",
      answer:
        "Yes. Khata Nex allows you to create and manage invoices for your customers, helping you maintain organized sales and payment records.",
      icon: FileText,
    },
    {
      question: "Does Khata Nex support inventory management?",
      answer:
        "Yes. The inventory management feature can help you track products, stock quantities, product prices, and available stock so that you can manage your business more efficiently.",
      icon: Package,
    },
    {
      question: "Can I generate business reports?",
      answer:
        "Yes. Khata Nex can provide useful reports related to customers, transactions, payments, sales, and overall business performance.",
      icon: BarChart3,
    },
    {
      question: "Is my business data secure?",
      answer:
        "Khata Nex is designed with security in mind. Your account and business information can be protected using secure authentication and appropriate data-protection practices.",
      icon: ShieldCheck,
    },
    {
      question: "Can I access Khata Nex from my mobile?",
      answer:
        "Yes. Khata Nex is designed to be responsive, allowing you to access your business information from mobile phones, tablets, laptops, and desktop computers.",
      icon: HelpCircle,
    },
    {
      question: "What happens if I forget my password?",
      answer:
        "You can use the Forgot Password option on the login page to reset your password using your registered email address or phone number.",
      icon: ShieldCheck,
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-50 py-20">
      {/* Background Decorations */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-600">
            <HelpCircle size={18} />
            Frequently Asked Questions
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Everything You Need to Know About{" "}
            <span className="text-sky-500">Khata Nex</span>
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
            Find answers to common questions about Digital Khata, customers,
            payments, invoices, inventory, reports, and your Khata Nex account.
          </p>
        </div>

        {/* FAQ List */}
        <div className="mx-auto max-w-4xl space-y-4">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
                  isOpen
                    ? "border-sky-300 shadow-lg shadow-sky-100"
                    : "border-slate-200 hover:border-sky-200 hover:shadow-md"
                }`}
              >
                {/* Question */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                        isOpen
                          ? "bg-sky-500 text-white"
                          : "bg-sky-50 text-sky-500"
                      }`}
                    >
                      <Icon size={21} />
                    </div>

                    <span className="text-base font-semibold text-slate-800 sm:text-lg">
                      {faq.question}
                    </span>
                  </div>

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 bg-sky-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-slate-100 px-5 pb-6 pt-4 sm:px-6">
                      <div className="ml-0 sm:ml-14">
                        <p className="text-sm leading-7 text-slate-600 sm:text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Contact Card */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 px-6 py-10 text-center shadow-xl shadow-sky-200 sm:px-10">
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10" />

            <div className="relative">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                <MessageCircle size={28} />
              </div>

              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Still Have Questions?
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-sky-50 sm:text-base">
                Can't find the answer you're looking for? Our support team is
                ready to help you with Khata Nex.
              </p>

              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-sky-600 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-sky-50"
              >
                <MessageCircle size={19} />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;