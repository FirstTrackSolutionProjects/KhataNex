import React from "react";
import {
  FileText,
  CheckCircle,
  UserCheck,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Ban,
  RefreshCw,
  Mail,
  ChevronRight,
} from "lucide-react";

const TermsOfUse = () => {
  const sections = [
    {
      id: "acceptance",
      icon: CheckCircle,
      title: "1. Acceptance of Terms",
      content: (
        <>
          <p>
            Welcome to KhataNex. By accessing or using the KhataNex
            platform, website, or services, you agree to be bound by these
            Terms of Use.
          </p>

          <p>
            If you do not agree with any part of these terms, please do not
            use KhataNex or its services.
          </p>
        </>
      ),
    },
    {
      id: "about",
      icon: FileText,
      title: "2. About KhataNex",
      content: (
        <>
          <p>
            KhatNex is a digital business management platform designed to
            help businesses manage their day-to-day records digitally.
          </p>

          <p>Depending on the features available, KhataNex may provide:</p>

          <ul>
            <li>Digital Khata management</li>
            <li>Customer management</li>
            <li>Payment tracking</li>
            <li>Invoice management</li>
            <li>Inventory management</li>
            <li>Business reports</li>
            <li>Business profile management</li>
          </ul>
        </>
      ),
    },
    {
      id: "account",
      icon: UserCheck,
      title: "3. User Account",
      content: (
        <>
          <p>
            Some KhataNex features may require you to create an account. You
            are responsible for providing accurate and up-to-date information
            during registration.
          </p>

          <p>
            You are responsible for maintaining the confidentiality of your
            login credentials and for all activity performed through your
            account.
          </p>

          <p>
            If you believe that your account has been accessed without
            authorization, you should notify KhataNex as soon as possible.
          </p>
        </>
      ),
    },
    {
      id: "business-data",
      icon: FileText,
      title: "4. Business and Customer Data",
      content: (
        <>
          <p>
            KhataNex allows users to store business-related information,
            including customer details, transactions, payments, invoices,
            products, and other records.
          </p>

          <p>
            You are responsible for ensuring that the information you enter
            into KhataNex is accurate, lawful, and appropriate for your
            business purposes.
          </p>

          <p>
            You must have the necessary authority or lawful basis to collect
            and use information about your customers and other individuals.
          </p>
        </>
      ),
    },
    {
      id: "acceptable-use",
      icon: ShieldCheck,
      title: "5. Acceptable Use",
      content: (
        <>
          <p>
            You agree to use KhataNex only for lawful business and personal
            purposes permitted by these Terms.
          </p>

          <p>You must not:</p>

          <ul>
            <li>Use KhataNex for fraudulent or illegal activities.</li>
            <li>
              Attempt to gain unauthorized access to another user's account.
            </li>
            <li>
              Upload malicious software, viruses, or harmful code.
            </li>
            <li>
              Attempt to interfere with the operation or security of the
              platform.
            </li>
            <li>
              Use the platform to violate the rights or privacy of another
              person.
            </li>
            <li>
              Copy, modify, distribute, or misuse KhataNex's proprietary
              software or content without authorization.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "payments",
      icon: CreditCard,
      title: "6. Payments and Transactions",
      content: (
        <>
          <p>
            KhataNex may provide features for recording and tracking
            payments and transactions.
          </p>

          <p>
            Unless specifically stated otherwise, KhataNex does not
            independently guarantee the completion, settlement, or validity of
            transactions recorded by users.
          </p>

          <p>
            Users are responsible for verifying transaction details,
            payment amounts, customer information, and business records.
          </p>
        </>
      ),
    },
    {
      id: "accuracy",
      icon: CheckCircle,
      title: "7. Accuracy of Information",
      content: (
        <p>
          You are responsible for ensuring that the information entered into
          your KhataNex account is complete, accurate, and current. Khata Nex
          is not responsible for losses resulting from incorrect, incomplete,
          outdated, or misleading information entered by users.
        </p>
      ),
    },
    {
      id: "availability",
      icon: RefreshCw,
      title: "8. Service Availability",
      content: (
        <>
          <p>
            We aim to keep KhataNex available and reliable, but we do not
            guarantee that the service will always be uninterrupted,
            error-free, or available at all times.
          </p>

          <p>
            The service may occasionally be unavailable due to maintenance,
            updates, technical problems, security issues, internet failures,
            or circumstances outside our reasonable control.
          </p>
        </>
      ),
    },
    {
      id: "security",
      icon: ShieldCheck,
      title: "9. Security",
      content: (
        <>
          <p>
            KhataNex uses reasonable security measures to help protect user
            accounts and business information.
          </p>

          <p>
            However, no online service can guarantee complete security.
            Users should protect their passwords and avoid sharing account
            credentials with unauthorized persons.
          </p>
        </>
      ),
    },
    {
      id: "intellectual-property",
      icon: FileText,
      title: "10. Intellectual Property",
      content: (
        <p>
          KhataNex, including its software, design, branding, logos,
          graphics, interface, text, and other original content, may be
          protected by applicable intellectual property laws. Except where
          permitted by law or expressly authorized by KhataNex, you may not
          reproduce, modify, distribute, sell, or create derivative works from
          these materials.
        </p>
      ),
    },
    {
      id: "prohibited",
      icon: Ban,
      title: "11. Prohibited Activities",
      content: (
        <>
          <p>
            You may not use KhataNex to conduct activities that are unlawful,
            fraudulent, deceptive, abusive, or harmful.
          </p>

          <p>
            KhataNex may take appropriate action, including restricting or
            suspending access, when there is reasonable evidence of misuse,
            security threats, fraud, or violation of these Terms.
          </p>
        </>
      ),
    },
    {
      id: "termination",
      icon: AlertTriangle,
      title: "12. Account Suspension or Termination",
      content: (
        <>
          <p>
            KhataNex may suspend or terminate an account when necessary to
            protect the platform, users, or third parties, or when a user
            violates these Terms or applicable law.
          </p>

          <p>
            Users may also stop using the service or request account
            termination according to the available account-management
            procedures.
          </p>
        </>
      ),
    },
    {
      id: "liability",
      icon: AlertTriangle,
      title: "13. Limitation of Liability",
      content: (
        <p>
          To the extent permitted by applicable law, KhataNex will not be
          responsible for indirect, incidental, special, consequential, or
          business-related losses arising from the use of the platform,
          including losses resulting from incorrect data entered by users,
          service interruptions, unauthorized access, or reliance on
          business records generated through the platform.
        </p>
      ),
    },
    {
      id: "privacy",
      icon: ShieldCheck,
      title: "14. Privacy",
      content: (
        <p>
          Your use of KhataNex is also subject to our Privacy Policy, which
          explains how we collect, use, protect, and manage information
          associated with your use of the platform.
        </p>
      ),
    },
    {
      id: "changes",
      icon: RefreshCw,
      title: "15. Changes to These Terms",
      content: (
        <p>
          KhataNex may update these Terms of Use from time to time to reflect
          changes to our services, technology, business practices, or legal
          requirements. Updated terms will be made available through the
          platform or other appropriate communication channels.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-600 to-cyan-500 py-20">
        {/* Decorative Circles */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg backdrop-blur-sm">
            <FileText size={34} />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Terms of Use
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-sky-50 sm:text-lg">
            Please read these terms carefully before using KhataNex and its
            business management services.
          </p>

          {/* Updated Date */}
          {/* <div className="mt-6 inline-flex items-center rounded-full bg-white/15 px-5 py-2 text-sm text-white backdrop-blur-sm">
            Last Updated: August 19, 2026
          </div> */}
        </div>
      </section>

      {/* Main Section */}
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

                      <span>
                        {section.title.replace(/^\d+\.\s/, "")}
                      </span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <main className="space-y-6">
              {/* Introduction */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome to KhataNex
                </h2>

                <p className="mt-4 leading-7 text-slate-600">
                  These Terms of Use govern your access to and use of the
                  KhataNex platform, website, and related services.
                </p>

                <p className="mt-4 leading-7 text-slate-600">
                  KhataNex provides digital tools that can help businesses
                  manage customers, transactions, payments, invoices,
                  inventory, and business records.
                </p>
              </div>

              {/* Policy Sections */}
              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <article
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
                  >
                    {/* Heading */}
                    <div className="mb-5 flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                        <Icon size={22} />
                      </div>

                      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                        {section.title}
                      </h2>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                      {section.content}
                    </div>
                  </article>
                );
              })}

              {/* Contact Card */}
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
                      Questions About These Terms?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-sky-50 sm:text-base">
                      If you have questions about these Terms of Use or need
                      assistance with KhataNex, please contact our support
                      team.
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

              {/* Legal Notice */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={21}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-sm leading-6 text-amber-800">
                    <strong>Important:</strong> These Terms of Use are a
                    general product template for KhataNex. Before using them
                    as final legal terms, they should be reviewed and
                    customized according to your actual business entity,
                    services, payment providers, jurisdiction, refund policy,
                    dispute-resolution process, and applicable laws.
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfUse;