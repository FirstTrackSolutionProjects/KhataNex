import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowRight,
  CalendarDays,
  Clock,
  BookOpen,
  CreditCard,
  Package,
  FileText,
  BarChart3,
  Users,
  X,
} from "lucide-react";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Business Tips",
    "Digital Khata",
    "Payments",
    "Invoicing",
    "Inventory",
    "Finance",
  ];

  const blogs = [
    {
      id: 1,
      title: "How Digital Khata Can Simplify Your Daily Business",
      description:
        "Learn how moving from traditional notebooks to digital records can make customer and transaction management easier.",
      category: "Digital Khata",
      date: "Aug 15, 2026",
      readTime: "5 min read",
      icon: BookOpen,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: 2,
      title: "5 Simple Ways to Manage Your Business Payments",
      description:
        "Discover practical ways to track received, pending and outgoing payments without losing important records.",
      category: "Payments",
      date: "Aug 12, 2026",
      readTime: "4 min read",
      icon: CreditCard,
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      id: 3,
      title: "Why Every Small Business Needs Better Customer Records",
      description:
        "Organized customer records help you understand balances, transaction history and business relationships.",
      category: "Business Tips",
      date: "Aug 09, 2026",
      readTime: "6 min read",
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      id: 4,
      title: "A Beginner's Guide to Business Invoices",
      description:
        "Understand the importance of invoices and how organized invoice management can improve your business workflow.",
      category: "Invoicing",
      date: "Aug 05, 2026",
      readTime: "5 min read",
      icon: FileText,
      gradient: "from-orange-500 to-amber-600",
    },
    {
      id: 5,
      title: "How to Keep Your Business Inventory Organized",
      description:
        "Learn simple inventory management practices that can help reduce confusion and improve stock visibility.",
      category: "Inventory",
      date: "Aug 02, 2026",
      readTime: "7 min read",
      icon: Package,
      gradient: "from-pink-500 to-rose-600",
    },
    {
      id: 6,
      title: "Understanding Your Business Through Reports",
      description:
        "Business reports can help you identify trends, understand transactions and make better decisions.",
      category: "Finance",
      date: "Jul 29, 2026",
      readTime: "6 min read",
      icon: BarChart3,
      gradient: "from-indigo-500 to-blue-600",
    },
    {
      id: 7,
      title: "Small Business Management: Where Should You Start?",
      description:
        "A practical guide for business owners who want to organize their customers, payments and daily records.",
      category: "Business Tips",
      date: "Jul 25, 2026",
      readTime: "5 min read",
      icon: Users,
      gradient: "from-emerald-500 to-green-600",
    },
    {
      id: 8,
      title: "Digital Payments and the Modern Small Business",
      description:
        "Explore how digital payment tracking can help businesses maintain clearer and more organized records.",
      category: "Payments",
      date: "Jul 21, 2026",
      readTime: "4 min read",
      icon: CreditCard,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      id: 9,
      title: "From Notebook to Digital: Modernizing Your Khata",
      description:
        "See why businesses are moving toward digital record keeping and how it can simplify everyday work.",
      category: "Digital Khata",
      date: "Jul 18, 2026",
      readTime: "5 min read",
      icon: BookOpen,
      gradient: "from-teal-500 to-emerald-600",
    },
  ];

  const featuredBlog = blogs[0];

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesCategory =
        activeCategory === "All" ||
        blog.category === activeCategory;

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        blog.title.toLowerCase().includes(search) ||
        blog.description.toLowerCase().includes(search) ||
        blog.category.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600">

        {/* Background Shapes */}
        <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
              <BookOpen size={16} />
              KHATANEX Blog
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Ideas to Help Your
              <span className="block text-yellow-300">
                Business Grow
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
              Discover practical business tips, digital khata
              insights, payment management ideas and simple ways
              to organize your business.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 max-w-xl">

              <div className="relative">

                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search articles..."
                  className="h-14 w-full rounded-2xl border border-white/20 bg-white pl-12 pr-12 text-sm text-slate-800 outline-none shadow-xl placeholder:text-slate-400 focus:ring-4 focus:ring-white/20"
                />

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          CATEGORY FILTER
      ====================================================== */}
      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex min-w-max items-center justify-center gap-2">

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {category}
              </button>
            ))}

          </div>

        </div>
      </section>

      {/* =====================================================
          FEATURED BLOG
      ====================================================== */}
      <section className="bg-slate-50 py-14 sm:py-16">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-8 flex items-end justify-between">

            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                Featured
              </span>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Featured Article
              </h2>
            </div>

          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="grid lg:grid-cols-2">

              {/* Image / Visual */}
              <div
                className={`flex min-h-[300px] items-center justify-center bg-gradient-to-br ${featuredBlog.gradient} p-10 lg:min-h-[400px]`}
              >

                <div className="text-center">

                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-white/20 text-white shadow-xl backdrop-blur-sm">
                    <BookOpen size={55} />
                  </div>

                  <p className="mt-6 text-sm font-bold uppercase tracking-widest text-white/80">
                    Digital Khata
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-white">
                    Smart Business
                  </p>

                </div>

              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-7 sm:p-10">

                <div className="flex flex-wrap items-center gap-3">

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {featuredBlog.category}
                  </span>

                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <CalendarDays size={14} />
                    {featuredBlog.date}
                  </span>

                </div>

                <h3 className="mt-5 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                  {featuredBlog.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-500">
                  {featuredBlog.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={15} />
                  {featuredBlog.readTime}
                </div>

                <Link
                  to={`/blog/${featuredBlog.id}`}
                  className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Read Article
                  <ArrowRight size={17} />
                </Link>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          BLOG GRID
      ====================================================== */}
      <section className="bg-white py-14 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <span className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                Latest Articles
              </span>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Business Insights
              </h2>

            </div>

            <p className="text-sm text-slate-500">
              {filteredBlogs.length} article
              {filteredBlogs.length !== 1 ? "s" : ""} found
            </p>

          </div>

          {/* Cards */}
          {filteredBlogs.length > 0 ? (

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {filteredBlogs.map((blog) => {

                const Icon = blog.icon;

                return (
                  <article
                    key={blog.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
                  >

                    {/* Blog Visual */}
                    <div
                      className={`relative flex h-48 items-center justify-center bg-gradient-to-br ${blog.gradient}`}
                    >

                      <div className="absolute inset-0 bg-black/5" />

                      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg backdrop-blur-sm transition duration-300 group-hover:scale-110">
                        <Icon size={35} />
                      </div>

                      {/* Category */}
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700">
                        {blog.category}
                      </span>

                    </div>

                    {/* Content */}
                    <div className="p-6">

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">

                        <span className="flex items-center gap-1">
                          <CalendarDays size={13} />
                          {blog.date}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {blog.readTime}
                        </span>

                      </div>

                      {/* Title */}
                      <h3 className="mt-4 line-clamp-2 text-lg font-bold leading-7 text-slate-900 transition group-hover:text-emerald-600">
                        {blog.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                        {blog.description}
                      </p>

                      {/* Read More */}
                      <Link
                        to={`/blog/${blog.id}`}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 transition hover:text-emerald-700"
                      >
                        Read More
                        <ArrowRight
                          size={16}
                          className="transition group-hover:translate-x-1"
                        />
                      </Link>

                    </div>

                  </article>
                );
              })}

            </div>

          ) : (

            /* Empty State */
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <Search size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No articles found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another search term or select a different category.
              </p>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                }}
                className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Clear Filters
              </button>

            </div>

          )}

        </div>
      </section>

      {/* =====================================================
          NEWSLETTER / CTA
      ====================================================== */}
      <section className="bg-slate-50 py-16">

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-6 py-12 text-center shadow-xl sm:px-12">

            <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
                <BookOpen size={27} />
              </div>

              <h2 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
                Want More Business Tips?
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
                Explore more practical ideas and insights to help
                you manage and grow your business with confidence.
              </p>

              <Link
                to="/contact"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
              >
                Get in Touch
                <ArrowRight size={17} />
              </Link>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

export default Blog;