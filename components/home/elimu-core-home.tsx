import Link from "next/link";
import { HeroGallery } from "@/components/home/hero-gallery";
import type { HomePageData } from "@/lib/types";

const membershipPlans = [
  {
    name: "1 Month",
    price: "KSh 300",
    detail: "FULL UNLIMITED ACCESS",
    expiry: "Membership expires after 1 month",
    badge: "Starter",
    cardClass:
      "border-stone-800 bg-gradient-to-br from-stone-900 via-stone-900 to-rose-950 text-white hover:border-stone-700 hover:from-stone-950 hover:to-rose-950 hover:text-white",
    badgeClass:
      "bg-white/15 text-white group-hover:bg-white group-hover:text-slate-900",
    mutedClass:
      "text-slate-200 group-hover:text-slate-200",
    panelClass:
      "bg-white/10 text-slate-200 group-hover:bg-white/15 group-hover:text-slate-100",
    amountClass:
      "text-amber-300 group-hover:text-amber-300",
    emphasisClass:
      "text-amber-300 group-hover:text-amber-300",
    expiryClass:
      "text-amber-200 group-hover:text-amber-200"
  },
  {
    name: "6 Months",
    price: "KSh 500",
    detail: "FULL UNLIMITED ACCESS",
    expiry: "Membership expires after 6 months",
    badge: "Most Popular",
    cardClass:
      "border-rose-800 bg-gradient-to-br from-rose-900 via-rose-900 to-red-800 text-white hover:border-rose-700 hover:from-rose-950 hover:to-red-900 hover:text-white",
    badgeClass:
      "bg-white/15 text-white group-hover:bg-white group-hover:text-rose-900",
    mutedClass:
      "text-rose-100 group-hover:text-rose-100",
    panelClass:
      "bg-white/10 text-rose-100 group-hover:bg-white/15 group-hover:text-rose-100",
    amountClass:
      "text-amber-300 group-hover:text-amber-300",
    emphasisClass:
      "text-amber-300 group-hover:text-amber-300",
    expiryClass:
      "text-amber-200 group-hover:text-amber-200"
  },
  {
    name: "1 Year",
    price: "KSh 1000",
    detail: "FULL UNLIMITED ACCESS",
    expiry: "Membership expires after 1 year",
    badge: "Best Value",
    cardClass:
      "border-orange-700 bg-gradient-to-br from-orange-700 via-orange-700 to-amber-700 text-white hover:border-orange-800 hover:from-orange-800 hover:to-amber-800 hover:text-white",
    badgeClass:
      "bg-white/15 text-white group-hover:bg-white group-hover:text-orange-700",
    mutedClass:
      "text-orange-100 group-hover:text-orange-100",
    panelClass:
      "bg-white/10 text-orange-100 group-hover:bg-white/15 group-hover:text-orange-100",
    amountClass:
      "text-amber-300 group-hover:text-amber-300",
    emphasisClass:
      "text-amber-300 group-hover:text-amber-300",
    expiryClass:
      "text-amber-200 group-hover:text-amber-200"
  }
] as const;

const categoryPillStyles: Record<string, string> = {
  "Past Papers":
    "border-rose-900 bg-rose-900 text-white",
  Notes:
    "border-red-800 bg-red-800 text-white",
  "Topical Questions":
    "border-orange-800 bg-orange-800 text-white",
  "Schemes of Work":
    "border-amber-700 bg-amber-700 text-white",
  "Lesson Plans":
    "border-rose-800 bg-rose-800 text-white",
  Assignments:
    "border-stone-700 bg-stone-700 text-white",
  Setbooks:
    "border-red-900 bg-red-900 text-white",
  "PowerPoint Notes":
    "border-orange-900 bg-orange-900 text-white"
};

const navLinkClass =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-3 text-[13px] font-semibold text-rose-900 transition group-hover/nav:bg-rose-900 group-hover/nav:text-white xl:px-3 xl:text-sm";

const primaryButtonClass =
  "brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5";

const secondaryButtonClass =
  "brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition";

const sectionKickerClass =
  "brand-kicker text-sm font-bold uppercase tracking-[0.2em]";

const headerNavItems = [
  {
    label: "About Us",
    href: "#faq",
    columns: [
      {
        title: "ELimuCore",
        links: ["About ELimuCore", "Who We Serve", "Why Choose ELimuCore"]
      },
      {
        title: "Access",
        links: ["How Membership Works", "Unlimited Downloads", "Contact Support"]
      }
    ]
  },
  {
    label: "Resources",
    href: "/resources",
    columns: [
      {
        title: "Revision",
        links: ["KCSE Past Papers", "Marking Schemes", "Class Notes"]
      },
      {
        title: "Study Materials",
        links: ["Topical Questions", "Setbook Guides", "PowerPoint Notes"]
      }
    ]
  },
  {
    label: "School Levels",
    href: "#levels",
    columns: [
      {
        title: "CBE",
        links: ["Pre-Primary", "Lower Primary", "Upper Primary"]
      },
      {
        title: "KCSE",
        links: ["Junior School", "Form 3 Resources", "Form 4 Revision"]
      }
    ]
  },
  {
    label: "Teacher Tools",
    href: "#resources",
    columns: [
      {
        title: "Planning",
        links: ["Lesson Plans", "Schemes of Work", "Teaching Guides"]
      },
      {
        title: "Assessment",
        links: ["Exams & Answers", "Holiday Assignments", "Assessment Tools"]
      }
    ]
  },
  {
    label: "Parent Support",
    href: "#faq",
    columns: [
      {
        title: "Home Learning",
        links: ["Home Revision Packs", "Homework Support", "Study Timetables"]
      },
      {
        title: "Exam Help",
        links: ["Grade-Based Resources", "Exam Preparation", "Parent FAQs"]
      }
    ]
  },
  {
    label: "Membership",
    href: "/account",
    columns: [
      {
        title: "Plans",
        links: ["1 Month Plan: KSh 300", "6 Months Plan: KSh 500", "1 Year Plan: KSh 1000"]
      },
      {
        title: "Member Help",
        links: ["Payment Instructions", "Member Login", "Download Help"]
      }
    ]
  },
  { label: "Contact", href: "#faq", columns: [] }
] as const;

export function ElimuCoreHome({
  quickLinks,
  schoolLevels,
  categories,
  featuredResources,
  stats
}: HomePageData) {
  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-50 border-b border-stone-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-500 bg-white text-sm font-black text-rose-900 shadow-sm">
                EC
              </div>
              <div className="leading-tight">
                <p className="text-sm font-black uppercase tracking-tight text-rose-900">
                  ELimuCore
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                  Teachers & Parents Resource Hub
                </p>
              </div>
            </Link>

            <div className="hidden items-center lg:flex">
              <Link
                href="/resources"
                aria-label="Search resources"
                className="rounded-full p-2 text-slate-700 transition hover:bg-amber-50 hover:text-orange-500"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35m1.1-5.4a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1">
            {headerNavItems.map((item) => (
              <div key={item.label} className="group/nav relative">
                <Link href={item.href} className={navLinkClass}>
                  <span>{item.label}</span>
                  {item.columns.length > 0 ? (
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition group-hover/nav:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  ) : null}
                </Link>

                {item.columns.length > 0 ? (
                  <div
                    className="invisible absolute left-0 top-full z-50 w-[34rem] translate-y-3 rounded-b-2xl bg-rose-900 p-5 text-white opacity-0 shadow-2xl shadow-rose-950/20 transition group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100"
                  >
                    <div className="grid grid-cols-2 gap-5">
                      {item.columns.map((column) => (
                        <div
                          key={column.title}
                          className="border-r border-white/15 pr-5 last:border-r-0 last:pr-0"
                        >
                          <p className="border-b border-white/20 pb-2 text-sm font-black text-amber-400">
                            {column.title}
                          </p>
                          <div className="mt-3 grid gap-0">
                            {column.links.map((link) => (
                              <Link
                                key={link}
                                href={item.href}
                                className="border-b border-white/10 py-2 text-sm font-semibold text-white transition hover:translate-x-1 hover:text-amber-300"
                              >
                                {link}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="rounded-3xl bg-orange-500 px-5 py-3 text-xs font-black uppercase tracking-wide text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              Join Us Today!
            </Link>
            <Link
              href="/resources"
              className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white lg:hidden"
            >
              Menu
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-stone-50 to-amber-50" />
          <div className="absolute inset-x-0 top-10 h-[24rem] bg-gradient-to-b from-stone-800/20 via-stone-700/10 to-transparent" />
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-rose-300/25 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
            <div>
              <HeroGallery />

              <form
                action="/resources"
                className="mt-8 flex flex-col gap-4 rounded-[2rem] border border-rose-100 bg-white p-4 shadow-[var(--shadow-soft)] sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <label
                    htmlFor="homepage-search"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Search by grade, subject, or resource type
                  </label>
                  <input
                    id="homepage-search"
                    name="q"
                    type="text"
                    placeholder="Search lesson plans, homework support, KCSE papers, or CBE assessments..."
                    className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm outline-none ring-0 placeholder:text-stone-400 transition focus:border-rose-700 focus:bg-white"
                  />
                </div>
                <button className={`rounded-2xl px-6 py-3 ${primaryButtonClass}`}>
                  Search Library
                </button>
              </form>

              <div className="mt-6 flex flex-wrap gap-3">
                {categories.map((item) => {
                  const colorClasses =
                    categoryPillStyles[item.name] ??
                    "border-slate-200 bg-white text-slate-600";

                  return (
                    <Link
                      key={item.slug}
                      href={`/resources?category=${encodeURIComponent(item.slug)}`}
                      style={{ color: "#ffffff" }}
                      className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition hover:border-rose-700 hover:bg-rose-900 hover:text-white ${colorClasses}`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="group surface-card rounded-[2rem] border border-rose-100 p-6 transition hover:-translate-y-1 hover:border-rose-700 hover:bg-rose-900 hover:text-white">
                <p className="text-sm font-semibold text-amber-700 transition group-hover:text-amber-100">
                  Quick access
                </p>
                <h2 className="font-display mt-2 text-2xl font-black tracking-tight transition group-hover:text-white">
                  Start with the most-used collections
                </h2>
                <div className="mt-5 space-y-4">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="group block rounded-2xl border border-stone-200 p-4 transition hover:-translate-y-0.5 hover:border-rose-700 hover:bg-rose-900 hover:text-white hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 transition group-hover:text-white">
                            {link.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600 transition group-hover:text-rose-100">
                            {link.desc}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 transition group-hover:bg-white group-hover:text-rose-900">
                          {link.badge}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="brand-band grid gap-4 rounded-[2rem] p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10"
              >
                <p className="text-3xl font-black tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="levels"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="max-w-2xl">
            <p className={sectionKickerClass}>
              School levels
            </p>
            <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Organized for busy teachers and involved parents
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Every level is grouped so teachers can plan quickly and parents
              can find the right support materials without digging through
              crowded pages.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {schoolLevels.map((level) => (
              <div
                key={level.title}
                className="group rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-rose-700 hover:bg-rose-900 hover:text-white hover:shadow-[var(--shadow-soft)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-xl font-bold text-rose-900 transition group-hover:bg-white/15 group-hover:text-white">
                  {level.title.split(" ")[0].charAt(0)}
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 transition group-hover:text-white">
                  {level.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 transition group-hover:text-rose-100">
                  {level.subtitle}
                </p>
                <div className="mt-6 space-y-3">
                  {level.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-rose-900 group-hover:bg-white/10 group-hover:text-white"
                    >
                      <span>{item.label}</span>
                      <span className="text-amber-400 transition group-hover:text-amber-100 hover:text-rose-900">
                        -&gt;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="resources" className="border-y border-slate-200 bg-white/70">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className={sectionKickerClass}>
                  Why parents and teachers stay with it
                </p>
                <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Built for planning, home support, and trust
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  ELimuCore is shaped around how schools and families actually
                  work: quick planning, clear search, and resources that feel
                  easy to trust on desktop or mobile.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  [
                    "Teacher-ready structure",
                    "Lesson plans, schemes of work, exams, and revision materials are arranged in a way that supports day-to-day classroom planning."
                  ],
                  [
                    "Simple for parents to use",
                    "Parents can quickly find support materials by grade, subject, or exam level without sorting through school-style menus."
                  ],
                  [
                    "Unlimited member downloads",
                    "An active membership gives full access to the library, so you can download the resources you need without extra charges."
                  ],
                  [
                    "Built for reliable access",
                    "The platform is designed to stay fast, organized, and easy to use for both teachers managing classes and parents supporting learners at home."
                  ]
                ].map(([title, desc]) => (
                  <div
                    key={title}
                    className="group rounded-[2rem] border border-rose-100 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/80 p-6 transition hover:-translate-y-1 hover:border-rose-700 hover:bg-rose-900 hover:from-rose-900 hover:to-rose-900"
                  >
                    <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 transition group-hover:text-rose-100">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="membership"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className={sectionKickerClass}>
              Membership
            </p>
            <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Simple plans with full unlimited access
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Every membership plan unlocks the full ELimuCore library. There
              are no download limits and no extra charges while your
              subscription is active.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {membershipPlans.map((plan) => (
              <article
                key={plan.name}
                className={`group rounded-[2rem] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] ${plan.cardClass}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-white transition">
                    {plan.name}
                  </p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold transition ${plan.badgeClass}`}>
                    {plan.badge}
                  </span>
                </div>

                <p className={`font-display mt-6 text-5xl font-black tracking-tight transition ${plan.amountClass}`}>
                  {plan.price}
                </p>
                <p className={`mt-3 text-lg font-semibold tracking-wide transition ${plan.emphasisClass}`}>
                  {plan.detail}
                </p>
                <p className={`mt-2 text-sm leading-6 transition ${plan.expiryClass}`}>
                  {plan.expiry}
                </p>

                <div className={`mt-8 rounded-2xl px-4 py-4 text-sm leading-6 transition ${plan.panelClass}`}>
                  Download all resources you need during the active membership
                  period without any extra charge.
                </div>

                <div className="mt-6 flex justify-center">
                  <Link
                    href="/signup"
                    className={`inline-flex ${secondaryButtonClass}`}
                  >
                    Start with this plan
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="featured"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={sectionKickerClass}>
                Featured resources
              </p>
              <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Popular with teachers and parents
              </h2>
            </div>
            <Link
              href="/resources"
              className={secondaryButtonClass}
            >
              View all resources
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredResources.map((resource) => (
              <article
                key={resource.slug}
                className="group rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-rose-700 hover:bg-rose-900 hover:text-white hover:shadow-lg"
              >
                <div className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-900 transition group-hover:bg-white group-hover:text-rose-900">
                  Featured
                </div>
                <h3 className="mt-4 text-lg font-bold leading-7 text-slate-900 transition group-hover:text-white">
                  {resource.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 transition group-hover:text-rose-100">{resource.meta}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600 transition group-hover:text-rose-100">
                  {resource.summary}
                </p>
                <Link
                  href={`/resources/${resource.slug}`}
                  className="mt-6 inline-block rounded-full px-3 py-2 text-sm font-semibold text-amber-700 transition group-hover:bg-white/10 group-hover:text-white hover:bg-white hover:text-rose-900"
                >
                  View resource -&gt;
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          id="faq"
          className="bg-gradient-to-r from-stone-950 via-rose-950 to-red-900 text-white"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                FAQ
              </p>
              <h2 className="font-display mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Simple answers for schools and families
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                This section answers the questions teachers and parents usually
                ask first, while building confidence in the platform.
              </p>
            </div>

            <div className="space-y-4">
              {[
                [
                  "How much is membership?",
                  "Membership is KSh 300 for 1 month, KSh 500 for 6 months, or KSh 1000 for 1 year. Each plan gives full unlimited access."
                ],
                [
                  "Are there download limits?",
                  "No. Your subscription has no limitations, which means you can download all the resources you need with no extra charge during the active plan period."
                ],
                [
                  "Can teachers find ready-to-use classroom files?",
                  "Yes. ELimuCore is designed to organize lesson plans, schemes of work, assessments, revision papers, and classroom support files in one place."
                ],
                [
                  "Can parents search by grade or subject?",
                  "Yes. Parents can search the library by grade, school level, subject, or resource type to find useful home-learning support quickly."
                ]
              ].map(([q, a]) => (
                <div
                  key={q}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
                >
                  <h3 className="text-lg font-bold">{q}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="cuea-crimson-band border-t border-amber-500/70">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-sm md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <p className="font-display text-2xl font-black tracking-tight text-white">
                ELimuCore membership gives full unlimited access.
              </p>
              <p className="mt-3 text-sm leading-7 text-rose-100">
                Plans are KSh 300 for 1 month, KSh 500 for 6 months, and KSh
                1000 for 1 year. Active members can download all the resources
                they need with no extra charge until membership expires.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="#membership"
                className="rounded-full px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-amber-500 hover:text-white"
              >
                Membership
              </a>
              <Link
                href="/resources"
                className="rounded-full px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-amber-500 hover:text-white"
              >
                Resource Library
              </Link>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-amber-500 hover:text-white"
              >
                Member Login
              </Link>
              <a
                href="#faq"
                className="rounded-full px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-amber-500 hover:text-white"
              >
                Support
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-white/20 pt-5 text-sm text-rose-100 sm:flex-row sm:items-center sm:justify-between">
            <p>2026 ELimuCore. Built for classrooms, parents, and unlimited member access.</p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/resources"
                className="rounded-full px-3 py-2 transition hover:bg-amber-500 hover:text-white"
              >
                Privacy
              </Link>
              <Link
                href="/resources"
                className="rounded-full px-3 py-2 transition hover:bg-amber-500 hover:text-white"
              >
                Terms
              </Link>
              <Link
                href="/resources"
                className="rounded-full px-3 py-2 transition hover:bg-amber-500 hover:text-white"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
