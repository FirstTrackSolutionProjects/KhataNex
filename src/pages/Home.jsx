import React from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import {
  BookOpen, ReceiptIndianRupee, Boxes, Users, BarChart3, Truck,
  ShieldCheck, Smartphone, Sparkles, ArrowRight, Check, X,
  Store, Wallet, BellRing, Lock, Cloud, ChevronDown, TrendingUp,
  UserCog, FileText, Zap, Briefcase, Building2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const FEATURES = [
  { icon: BookOpen, title: "Digital Khata", desc: "One running ledger of every credit and debit, so you always know who owes you what." },
  { icon: ReceiptIndianRupee, title: "GST Invoices & Quotations", desc: "Create, download and share tax invoices, quotations and money receipts in seconds." },
  { icon: Boxes, title: "Inventory & Purchases", desc: "Track stock levels, HSN codes and supplier purchases — never oversell again." },
  { icon: Users, title: "Customer Directory", desc: "Every customer's balance, history and contact details in one place." },
  { icon: BarChart3, title: "Reports & Analytics", desc: "See sales, dues and collections at a glance with daily and monthly summaries." },
  { icon: Truck, title: "Vehicles & Way Bills", desc: "Log outgoing and incoming trips with auto-generated way bills and photos." },
];

const STEPS = [
  { n: "01", t: "Create your business profile", d: "Sign up in under a minute and add your shop's basic details." },
  { n: "02", t: "Add customers & stock", d: "Bring in your existing khata and inventory, or start fresh." },
  { n: "03", t: "Record sales & payments", d: "Every transaction updates the ledger and stock automatically." },
  { n: "04", t: "Watch your business grow", d: "Use reports and dues tracking to plug leaks and follow up on credit." },
];

const BEFORE = [
  "Handwritten khata books that get lost, torn or disputed",
  "Month-end reconciliation that eats up days",
  "No idea how much stock is really left until it runs out",
  "Invoices made in Word or by hand, with GST errors",
  "Forgotten dues that quietly turn into bad debt",
];

const AFTER = [
  "One digital ledger, always up to date and backed up in the cloud",
  "Balances update the moment you record a sale or payment",
  "Live stock levels, so you promise only what you can deliver",
  "Professional GST invoices, ready to download and share",
  "Every outstanding due visible, so follow-ups never slip",
];

const AUDIENCES = [
  {
    icon: Store,
    title: "Shop & retail owners",
    points: ["Track credit customers without a register", "Know stock before the shelf is empty", "Share bills with customers in seconds"],
  },
  {
    icon: Building2,
    title: "Wholesalers & distributors",
    points: ["Manage supplier purchases and HSN codes", "Log vehicle trips with way bills", "See collections by day and month"],
  },
  {
    icon: Briefcase,
    title: "Agencies & service businesses",
    points: ["Send quotations and convert them to invoices", "Issue money receipts on payment", "Keep every client's balance in one place"],
  },
];

const TRUST = [
  { icon: Lock, t: "Private by design", d: "Your business data belongs to you and is only visible to people you allow." },
  { icon: Cloud, t: "Cloud-backed", d: "Your ledger is stored online, so a lost phone never means lost records." },
  { icon: UserCog, t: "Scoped staff access", d: "Give employees access only to the modules they need — nothing more." },
  { icon: Smartphone, t: "Works on any device", d: "Use it on the counter computer, a tablet or your phone." },
];

const FAQS = [
  {
    q: "What exactly is KhataNex?",
    a: "KhataNex is business-management software for Indian shops and small businesses. It replaces your paper khata, invoice book and stock register with one online dashboard that tracks customers, credit, GST invoices, inventory and payments.",
  },
  {
    q: "Do I need accounting knowledge to use it?",
    a: "No. If you can write an entry in a khata book, you can use KhataNex. You record a sale or payment, and the ledger, balances and stock update on their own.",
  },
  {
    q: "Can I bring in my existing customers and stock?",
    a: "Yes. You can add your existing customers, balances and inventory, or simply start fresh and build as you go.",
  },
  {
    q: "Can my staff use it too?",
    a: "Yes. You can add employees and give each one access to only the modules they need, such as billing but not reports.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes — you can start free and upgrade only when you need more. See the pricing page for the full comparison.",
  },
];

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

// Hero "product screenshot" card. Every colour is an explicit hex (arbitrary-value utility) on purpose:
// the site's global dark-mode rules remap bg-white / text-slate-* / emerald classes, and we want this
// sample card to look identical in light and dark mode. It also doesn't depend on any custom CSS.
const MOCK = {
  card: "relative rounded-3xl bg-[#ffffff] p-4 text-[#1e1b2e] shadow-[0_30px_60px_-20px_rgba(27,11,69,0.55)] ring-1 ring-white/50 sm:p-5",
  title: "font-display text-lg font-extrabold leading-tight text-[#2d1568]",
  sub: "text-xs text-[#64748b]",
  statIn: "rounded-xl bg-[#ecfdf5] p-3 text-[#047857]",
  statOut: "rounded-xl bg-[#fff1f2] p-3 text-[#be123c]",
  statLabel: "text-xs font-semibold",
  statAmount: "mt-1 font-display text-xl font-extrabold",
  list: "mt-4 overflow-hidden rounded-xl border border-[#ebe3ff]",
  row: "flex items-center justify-between gap-3 bg-[#ffffff] px-3 py-2.5",
  avatar: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ebe3ff] text-sm font-bold text-[#4f23a8]",
  name: "text-sm font-semibold leading-tight text-[#0f172a]",
  note: "text-xs text-[#64748b]",
  plus: "whitespace-nowrap text-sm font-bold text-[#059669]",
  minus: "whitespace-nowrap text-sm font-bold text-[#e11d48]",
  chip: "z-10 flex items-center gap-2.5 rounded-2xl bg-[#ffffff] px-3 py-2 shadow-[0_18px_36px_-14px_rgba(27,11,69,0.55)]",
  chipIcon: "flex h-8 w-8 items-center justify-center rounded-lg bg-[#ebe3ff] text-[#4f23a8]",
  chipIconGreen: "flex h-8 w-8 items-center justify-center rounded-lg bg-[#d1fae5] text-[#047857]",
  chipTitle: "text-xs font-bold leading-tight text-[#0f172a]",
  chipSub: "text-[11px] text-[#64748b]",
};

function HeroMockup() {
  const rows = [
    { name: "Sharma Traders", note: "Due since 12 days", amt: "₹ 8,200", tone: "in" },
    { name: "Gupta Stores", note: "Invoice #0142", amt: "₹ 4,250", tone: "in" },
    { name: "Verma Supplies", note: "Purchase bill", amt: "₹ 3,200", tone: "out" },
  ];
  // The two chips sit ABOVE and BELOW the card (the wrapper's pt/pb make room), so they never cover it.
  return (
    <div className="relative mx-auto w-full max-w-md pb-20 pt-16">
      <div className="absolute inset-x-0 bottom-10 top-10 rounded-[2rem] bg-brand-400/30 blur-3xl" aria-hidden="true" />

      <div className={`${MOCK.chip} kn-float absolute left-2 top-0`}>
        <span className={MOCK.chipIcon}><FileText size={16} /></span>
        <div>
          <p className={MOCK.chipTitle}>GST invoice sent</p>
          <p className={MOCK.chipSub}>to Gupta Stores</p>
        </div>
      </div>

      <div className={MOCK.card}>
        <div className="flex items-center gap-3">
          <BrandLogo size={46} rounded="rounded-xl" className="shadow-brand" />
          <div>
            <p className={MOCK.title}>KhataNex</p>
            <p className={MOCK.sub}>Today's ledger · sample data</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className={MOCK.statIn}>
            <p className={MOCK.statLabel}>You'll receive</p>
            <p className={MOCK.statAmount}>₹ 12,450</p>
          </div>
          <div className={MOCK.statOut}>
            <p className={MOCK.statLabel}>You'll pay</p>
            <p className={MOCK.statAmount}>₹ 3,200</p>
          </div>
        </div>

        <ul className={MOCK.list}>
          {rows.map((r, i) => (
            <li key={r.name} className={`${MOCK.row} ${i > 0 ? "border-t border-[#ebe3ff]" : ""}`}>
              <div className="flex items-center gap-3">
                <span className={MOCK.avatar}>{r.name[0]}</span>
                <div>
                  <p className={MOCK.name}>{r.name}</p>
                  <p className={MOCK.note}>{r.note}</p>
                </div>
              </div>
              <span className={r.tone === "in" ? MOCK.plus : MOCK.minus}>
                {r.tone === "in" ? "+" : "−"} {r.amt}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${MOCK.chip} kn-float-slow absolute bottom-0 right-2`}>
        <span className={MOCK.chipIconGreen}><TrendingUp size={16} /></span>
        <div>
          <p className={MOCK.chipTitle}>Collections up</p>
          <p className={MOCK.chipSub}>this month</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="bg-white text-slate-800">
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-brand-radial">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="section-pad relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <div className="text-white">
            <span className="eyebrow-on-dark">
              <Sparkles size={14} /> Business management, simplified
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
              Run your whole shop from{" "}
              <span className="text-accent-400">one khata</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100">
              KhataNex brings your customers, credit ledger, GST invoices, stock and
              payments together — so you spend less time in registers and more time
              growing your business.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="btn-accent">
                Start free <ArrowRight size={18} />
              </Link>
              <Link to="/pricing" className="btn-outline-light">
                View pricing
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-100">
              <span className="flex items-center gap-1.5"><Check size={16} className="text-emerald-300" /> No credit card needed</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-300" /> Your data stays yours</span>
              <span className="flex items-center gap-1.5"><Smartphone size={16} className="text-emerald-300" /> Works on any device</span>
            </div>
          </div>

          <HeroMockup />
        </div>
      </section>

      {/* ======================= AT-A-GLANCE STRIP ===================== */}
      <section className="border-b border-brand-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-8 text-center md:grid-cols-4 lg:px-8">
          {[
            { icon: BookOpen, t: "Digital khata" },
            { icon: ReceiptIndianRupee, t: "GST invoicing" },
            { icon: Boxes, t: "Live inventory" },
            { icon: BarChart3, t: "Instant reports" },
          ].map(({ icon: Icon, t }) => (
            <div key={t} className="flex items-center justify-center gap-2.5 text-brand-800">
              <Icon size={20} className="text-brand-500" />
              <span className="font-display text-sm font-bold sm:text-base">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= WHAT IS IT ========================= */}
      <section className="section-pad bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <span className="eyebrow">What is KhataNex?</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              A modern replacement for your paper khata and invoice book.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              If you run a shop, agency or small business, KhataNex replaces the
              stack of notebooks, loose receipts and spreadsheets you use to track
              money. It is a single dashboard for who owes you, what you sold, what
              is in stock, and where your cash is going — with GST invoices your
              customers actually trust.
            </p>
          </div>

          {/* Before / After */}
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
              <p className="font-display text-sm font-bold uppercase tracking-wider text-slate-500">
                Without KhataNex
              </p>
              <ul className="mt-5 space-y-3.5">
                {BEFORE.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      <X size={13} strokeWidth={3} />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-brand-gradient p-7 text-white shadow-brand-lg">
              <p className="font-display text-sm font-bold uppercase tracking-wider text-brand-200">
                With KhataNex
              </p>
              <ul className="mt-5 space-y-3.5">
                {AFTER.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-white">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-emerald-950">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================== FEATURES ========================== */}
      <section className="section-pad bg-brand-soft">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Everything in one place</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              All the tools a growing business needs
            </h2>
            <p className="mt-4 text-slate-600">
              From the first sale of the day to the monthly report — KhataNex covers
              the daily work so nothing falls through the cracks.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-brand">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= HOW IT WORKS ======================== */}
      <section className="section-pad bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Up and running in one afternoon
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border border-brand-100 bg-brand-50 p-6">
                <span className="font-display text-4xl font-extrabold text-brand-300">{s.n}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-900">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.d}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight
                    size={18}
                    className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-brand-300 md:block"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHO IT'S FOR / BENEFITS ================= */}
      <section className="section-pad bg-brand-950 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow-on-dark">Why businesses switch</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
              Stop losing money to forgotten dues.
            </h2>
            <p className="mt-4 text-brand-100">
              Most small businesses lose track of who owes them, which invoices are
              unpaid, and how much stock is actually sitting in the back room.
              KhataNex surfaces all of it automatically.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {AUDIENCES.map(({ icon: Icon, title, points }) => (
              <div key={title} className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-400 text-brand-950">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-white">{title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-brand-100">
                      <Check size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Benefit highlights */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Wallet, t: "Clear collections", d: "Daily and monthly totals at a glance" },
              { icon: BellRing, t: "Never miss a due", d: "Outstanding balances always in view" },
              { icon: Zap, t: "Faster billing", d: "Create and share invoices in seconds" },
              { icon: Boxes, t: "Stock you can trust", d: "Know what's on hand before you promise" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex items-start gap-3 rounded-xl bg-white/10 p-4">
                <Icon size={20} className="mt-0.5 shrink-0 text-accent-400" />
                <div>
                  <p className="font-display text-sm font-bold text-white">{t}</p>
                  <p className="mt-0.5 text-xs text-brand-100">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SECURITY / TRUST ======================== */}
      <section className="section-pad bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <span className="eyebrow">Built to be trusted</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Your numbers are safe, private and always with you.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map(({ icon: Icon, t, d }) => (
              <div key={t} className="card-brand">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-slate-900">{t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= PRICING TEASER ====================== */}
      {/* Solid white card with explicit dark text so nothing can wash out */}
      <section className="section-pad bg-brand-100">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-white p-8 text-center shadow-brand-lg ring-1 ring-brand-200 sm:p-12">
            <span className="eyebrow">Pricing</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Transparent, value-packed pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-700">
              Simple, affordable plans for every business — starting at{" "}
              <span className="font-extrabold text-brand-700">free</span>. No setup fees,
              no hidden charges, and you can upgrade or cancel whenever you like.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/pricing" className="btn-brand">
                See full pricing <ArrowRight size={18} />
              </Link>
              <Link to="/signup" className="btn-ghost-brand">
                Start free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== FAQ =========================== */}
      <section className="section-pad bg-white">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="eyebrow">Questions</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="kn-faq rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4">
                <summary className="flex items-center justify-between gap-4">
                  <span className="font-display text-base font-bold text-slate-900">{f.q}</span>
                  <ChevronDown size={20} className="kn-faq-chevron shrink-0 text-brand-600 transition-transform" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== FINAL CTA ========================= */}
      <section className="bg-white px-5 pb-16 lg:px-8 lg:pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand-radial px-8 py-14 text-center text-white shadow-brand-lg">
          <div className="bg-grid-faint pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <Sparkles size={28} className="mx-auto text-accent-400" />
            <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
              Ready to digitise your khata?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">
              Set up your business in minutes and replace the paper trail with
              clearer numbers. Start free — no credit card needed.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/signup" className="btn-accent">
                Create free account <ArrowRight size={18} />
              </Link>
              <Link to="/pricing" className="btn-outline-light">
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}