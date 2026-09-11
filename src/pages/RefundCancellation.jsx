import React from "react";
import {
  RefreshCw,
  CreditCard,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  Mail,
  ChevronRight,
} from "lucide-react";

const RefundCancellation = () => {
  const sections = [
    {
      id: "overview",
      icon: RefreshCw,
      title: "1. Refund & Cancellation Overview",
      content: (
        <>
          <p>
            At KhataNex, we aim to provide reliable digital business
            management services. This Refund & Cancellation Policy explains
            the conditions under which subscriptions, purchases, or eligible
            payments may be cancelled or refunded.
          </p>

          <p>
            By purchasing or subscribing to a paid KhataNex service, you
            acknowledge and agree to this policy.
          </p>
        </>
      ),
    },
    {
      id: "cancellation",
      icon: XCircle,
      title: "2. Cancellation Policy",
      content: (
        <>
          <p>
            Users may request cancellation of their KhataNex subscription or
            paid service according to the cancellation terms applicable to
            their selected plan.
          </p>

          <p>
            Cancellation requests should be submitted through the available
            account settings or by contacting KhataNex support.
          </p>

          <ul>
            <li>
              Cancellation may stop future recurring charges where applicable.
            </li>
            <li>
              Cancellation does not automatically guarantee a refund for
              amounts already paid.
            </li>
            <li>
              Any applicable refund will be determined according to the
              conditions described in this policy.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "eligibility",
      icon: CheckCircle,
      title: "3. Refund Eligibility",
      content: (
        <>
          <p>
            Refunds may be considered in situations where a user has been
            incorrectly charged, where a paid service was not provided as
            described, or where a refund is otherwise required under
            applicable law.
          </p>

          <p>
            Refund eligibility may also depend on the subscription plan,
            purchase date, payment method, and circumstances of the request.
          </p>
        </>
      ),
    },
    {
      id: "non-refundable",
      icon: AlertTriangle,
      title: "4. Non-Refundable Situations",
      content: (
        <>
          <p>
            Unless otherwise required by applicable law, certain payments may
            not be eligible for a refund.
          </p>

          <ul>
            <li>
              Services that have already been fully provided may not be
              refundable.
            </li>
            <li>
              Promotional or discounted purchases may have separate refund
              conditions.
            </li>
            <li>
              Payments made through unauthorized or fraudulent means may not
              be eligible for a refund.
            </li>
            <li>
              Requests submitted outside an applicable refund period may be
              declined.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "subscription",
      icon: CreditCard,
      title: "5. Subscription Cancellation",
      content: (
        <>
          <p>
            If KhataNex offers recurring subscriptions, users may cancel
            their subscription before the next billing cycle to prevent future
            recurring charges.
          </p>

          <p>
            Unless otherwise stated for a particular plan, cancelling a
            subscription generally does not automatically result in a refund
            for the unused portion of the current billing period.
          </p>
        </>
      ),
    },
    {
      id: "duplicate",
      icon: CreditCard,
      title: "6. Duplicate or Incorrect Payments",
      content: (
        <p>
          If you believe that you have been charged more than once for the
          same transaction or that an incorrect amount was charged, please
          contact KhataNex support with the relevant transaction details.
          After verification, eligible duplicate or incorrect charges may be
          refunded.
        </p>
      ),
    },
    {
      id: "refund-process",
      icon: Clock,
      title: "7. Refund Process",
      content: (
        <>
          <p>
            To request a refund, contact KhataNex support and provide the
            information necessary to identify the transaction.
          </p>

          <p>We may request:</p>

          <ul>
            <li>Name associated with the account</li>
            <li>Registered email address or mobile number</li>
            <li>Transaction or invoice reference</li>
            <li>Date and amount of payment</li>
            <li>Reason for the refund request</li>
          </ul>

          <p>
            Refund requests will be reviewed before a decision is made.
          </p>
        </>
      ),
    },
    {
      id: "refund-time",
      icon: Clock,
      title: "8. Refund Processing Time",
      content: (
        <p>
          Once a refund is approved, the amount will generally be returned
          using the original payment method where technically possible.
          Processing time may vary depending on the payment provider, bank,
          card issuer, or other financial institution involved.
        </p>
      ),
    },
    {
      id: "payment-provider",
      icon: CreditCard,
      title: "9. Payment Gateway and Third-Party Services",
      content: (
        <p>
          If payments are processed through a third-party payment gateway,
          refunds may also be subject to that provider's processing procedures
          and timelines. KhataNex will take reasonable steps to initiate an
          approved refund, but the final processing time may depend on the
          payment provider or financial institution.
        </p>
      ),
    },
    {
      id: "service-issues",
      icon: ShieldCheck,
      title: "10. Service Issues",
      content: (
        <>
          <p>
            If you experience a significant technical problem that prevents
            you from using a paid KhataNex service, please contact support
            promptly.
          </p>

          <p>
            Our team may investigate the issue and, where appropriate, provide
            technical assistance, service credit, extension, or refund
            according to the circumstances and applicable terms.
          </p>
        </>
      ),
    },
    {
      id: "legal-rights",
      icon: ShieldCheck,
      title: "11. Your Legal Rights",
      content: (
        <p>
          Nothing in this policy is intended to limit any consumer rights or
          remedies that cannot lawfully be excluded under applicable law.
          Where applicable law requires a refund, cancellation, or other
          remedy, KhataNex will comply with those requirements.
        </p>
      ),
    },
    {
      id: "changes",
      icon: RefreshCw,
      title: "12. Changes to This Policy",
      content: (
        <p>
          KhataNex may update this Refund & Cancellation Policy from time to
          time to reflect changes to our services, pricing, payment methods,
          business practices, or applicable legal requirements. Updated
          versions will be made available through the KhataNex platform.
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
            <RefreshCw size={34} />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Refund & Cancellation
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-sky-50 sm:text-lg">
            Learn about KhataNex cancellation requests, refund eligibility,
            payment issues, and refund processing.
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
                  KhataNex Refund Policy
                </h2>

                <p className="mt-4 leading-7 text-slate-600">
                  We want every KhataNex user to have a reliable experience.
                  This policy explains when cancellations and refunds may be
                  available for paid KhataNex services.
                </p>

                <p className="mt-4 leading-7 text-slate-600">
                  Please review this policy before purchasing a subscription or
                  other paid service.
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

              {/* Contact Card */}
              <div
                id="contact"
                className="scroll-mt-24 overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 p-8 shadow-xl shadow-sky-100 sm:p-10"
              >
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                    <HelpCircle size={28} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Need Help With a Refund?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-sky-50 sm:text-base">
                      If you have a question about a payment, cancellation, or
                      refund request, please contact our support team.
                    </p>

                    <a
                      href="mailto:support@khatanex.in"
                      className="mt-4 inline-flex items-center gap-2 font-semibold text-white underline underline-offset-4 transition hover:text-sky-100"
                    >
                      <Mail size={17} />
                      support@khatanex.in
                    </a>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={21}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-sm leading-6 text-amber-800">
                    <strong>Important:</strong> This is a general Refund &
                    Cancellation template for KhataNex. Before publishing it
                    as a final legal policy, customize the refund period,
                    subscription rules, payment gateway, applicable taxes,
                    cancellation process, and grievance/contact details based
                    on your actual business model and applicable law.
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

export default RefundCancellation;