import React from "react";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Database,
  FileText,
  CreditCard,
  Settings,
  Mail,
  ChevronRight,
} from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      id: "information",
      icon: UserCheck,
      title: "1. Information We Collect",
      content: (
        <>
          <p>
            When you use KhatNex, we may collect information that you
            provide directly to us and information generated through your use
            of our services.
          </p>

          <h4>Personal Information</h4>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Mobile number</li>
            <li>Business name</li>
            <li>Business contact information</li>
            <li>Login and account information</li>
          </ul>

          <h4>Business Information</h4>
          <ul>
            <li>Customer details</li>
            <li>Transaction records</li>
            <li>Credit and debit entries</li>
            <li>Payment information and payment status</li>
            <li>Invoice information</li>
            <li>Product and inventory information</li>
            <li>Business reports and records</li>
          </ul>
        </>
      ),
    },
    {
      id: "usage",
      icon: Database,
      title: "2. How We Use Your Information",
      content: (
        <>
          <p>
            We use collected information to provide, maintain, and improve
            KhataNex and its features.
          </p>

          <ul>
            <li>To create and manage your account</li>
            <li>To provide Digital Khata services</li>
            <li>To manage customer records</li>
            <li>To track transactions and payments</li>
            <li>To generate invoices and reports</li>
            <li>To provide inventory management features</li>
            <li>To communicate important account information</li>
            <li>To provide customer support</li>
            <li>To improve the performance and security of our platform</li>
            <li>To prevent unauthorized access, fraud, or misuse</li>
          </ul>
        </>
      ),
    },
    {
      id: "customer-data",
      icon: FileText,
      title: "3. Customer and Transaction Data",
      content: (
        <p>
          KhataNex allows businesses to store information about their
          customers and transactions. You are responsible for ensuring that
          you have the appropriate authority or lawful basis to provide such
          information to KhataNex and to use it for your business purposes.
        </p>
      ),
    },
    {
      id: "payments",
      icon: CreditCard,
      title: "4. Payment Information",
      content: (
        <p>
          If payment-related features are provided through KhataNex,
          payment information may be processed by authorized payment service
          providers. We do not intend to store sensitive payment credentials
          such as complete card numbers or banking passwords unless explicitly
          required and appropriately protected for a particular service.
        </p>
      ),
    },
    {
      id: "security",
      icon: Lock,
      title: "5. Data Security",
      content: (
        <>
          <p>
            We take reasonable technical and organizational measures to help
            protect your information against unauthorized access, alteration,
            disclosure, or destruction.
          </p>

          <p>
            Security measures may include secure authentication, access
            controls, encryption where appropriate, monitoring, and other
            safeguards.
          </p>

          <p>
            However, no internet-based service can guarantee absolute
            security. You should also protect your account credentials and
            avoid sharing your password with others.
          </p>
        </>
      ),
    },
    {
      id: "sharing",
      icon: UserCheck,
      title: "6. Sharing of Information",
      content: (
        <>
          <p>
            We do not sell your personal information for money. We may share
            information when reasonably necessary to operate KhataNex,
            provide requested services, comply with legal obligations, or
            protect our users and platform.
          </p>

          <p>Information may be shared with:</p>

          <ul>
            <li>Authorized service providers</li>
            <li>Cloud hosting and infrastructure providers</li>
            <li>Payment service providers where applicable</li>
            <li>Security and technology service providers</li>
            <li>Government or legal authorities when legally required</li>
          </ul>
        </>
      ),
    },
    {
      id: "cookies",
      icon: Settings,
      title: "7. Cookies and Similar Technologies",
      content: (
        <p>
          KhataNex may use cookies and similar technologies to maintain
          sessions, remember preferences, improve functionality, analyze
          usage, and enhance security. You may be able to control cookies
          through your browser settings, although disabling certain cookies
          may affect some features.
        </p>
      ),
    },
    {
      id: "retention",
      icon: Database,
      title: "8. Data Retention",
      content: (
        <p>
          We retain information for as long as reasonably necessary to provide
          our services, maintain business records, comply with applicable
          legal obligations, resolve disputes, enforce agreements, and protect
          our legitimate interests. Retention periods may vary depending on
          the type and purpose of the information.
        </p>
      ),
    },
    {
      id: "rights",
      icon: UserCheck,
      title: "9. Your Privacy Rights",
      content: (
        <>
          <p>
            Depending on applicable law, you may have rights relating to your
            personal data, including the ability to request access,
            correction, updating, or deletion of certain information.
          </p>

          <p>
            You may also have rights relating to consent and the processing of
            your personal data. Requests can be submitted through the contact
            information provided below.
          </p>
        </>
      ),
    },
    {
      id: "account",
      icon: Settings,
      title: "10. Account Responsibility",
      content: (
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for ensuring that information entered into
          your KhataNex account is accurate and lawful. Please contact us
          immediately if you believe that your account has been accessed
          without authorization.
        </p>
      ),
    },
    {
      id: "children",
      icon: ShieldCheck,
      title: "11. Children's Privacy",
      content: (
        <p>
          KhataNex is intended for business and general users and is not
          specifically directed toward children. We do not knowingly collect
          personal information from children in circumstances where such
          collection is prohibited by applicable law.
        </p>
      ),
    },
    {
      id: "changes",
      icon: FileText,
      title: "12. Changes to This Privacy Policy",
      content: (
        <p>
          We may update this Privacy Policy from time to time to reflect
          changes to our services, technology, legal requirements, or privacy
          practices. When we make material changes, we may provide an
          appropriate notice through the KhataNex platform or other available
          communication channels.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-600 to-cyan-500 py-20">
        {/* Decorative Background */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg backdrop-blur-sm">
            <ShieldCheck size={34} />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-sky-50 sm:text-lg">
            Your privacy matters to us. Learn how KhataNex collects, uses,
            protects, and manages your information.
          </p>

          {/* <div className="mt-6 inline-flex items-center rounded-full bg-white/15 px-5 py-2 text-sm text-white backdrop-blur-sm">
            Last Updated: August 19, 2026
          </div> */}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                  Contents
                </h3>

                <nav className="space-y-1">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-sky-50 hover:text-sky-600"
                    >
                      <ChevronRight size={15} />
                      <span>{section.title.replace(/^\d+\.\s/, "")}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Policy Content */}
            <div className="space-y-6">
              {/* Introduction */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome to KhataNex
                </h2>

                <p className="mt-4 leading-7 text-slate-600">
                  KhataNex is a digital business management platform designed
                  to help businesses manage customers, digital khata records,
                  payments, invoices, inventory, and business reports.
                </p>

                <p className="mt-4 leading-7 text-slate-600">
                  This Privacy Policy explains how information may be
                  collected, used, stored, protected, and disclosed when you
                  use KhataNex.
                </p>
              </div>

              {/* Sections */}
              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <article
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
                  >
                    <div className="mb-5 flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                        <Icon size={22} />
                      </div>

                      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                        {section.title}
                      </h2>
                    </div>

                    <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                      {section.content}
                    </div>
                  </article>
                );
              })}

              {/* Contact Section */}
              <div
                id="contact"
                className="scroll-mt-24 overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 p-8 shadow-xl shadow-sky-100 sm:p-10"
              >
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                    <Mail size={28} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Have a Privacy Question?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-sky-50 sm:text-base">
                      If you have questions, requests, or concerns regarding
                      this Privacy Policy or your personal information, please
                      contact the KhataNex support team.
                    </p>

                    <a
                      href="mailto:support@khatanex.com"
                      className="mt-4 inline-flex items-center gap-2 font-semibold text-white underline underline-offset-4 transition hover:text-sky-100"
                    >
                      <Mail size={17} />
                      support@khatanex.in
                    </a>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm leading-6 text-amber-800">
                  <strong>Important:</strong> This Privacy Policy is a
                  general product template for KhataNex and should be
                  reviewed and customized based on your actual data flows,
                  business entity, payment providers, hosting providers,
                  applicable jurisdictions, and legal requirements before
                  being used as a final legal policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
