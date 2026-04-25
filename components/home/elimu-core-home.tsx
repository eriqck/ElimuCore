import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/weblogo.png";
import { HeroGallery } from "@/components/home/hero-gallery";
import type { HomePageData } from "@/lib/types";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "#about" },
  { label: "Resources", href: "/resources" },
  { label: "School Levels", href: "#levels" },
  { label: "Membership", href: "#membership" },
  { label: "Support", href: "#faq" }
] as const;

const sectionKickerClass =
  "text-sm font-bold uppercase tracking-[0.24em] text-[#8b1028]";

const membershipPlans = [
  {
    name: "1 Month",
    price: "KSh 300",
    duration: "1 month",
    summary: "A simple starter plan for quick classroom or home-study support.",
    badge: "Starter"
  },
  {
    name: "6 Months",
    price: "KSh 500",
    duration: "6 months",
    summary: "A practical plan for steady teaching, planning, and revision support.",
    badge: "Popular"
  },
  {
    name: "1 Year",
    price: "KSh 1000",
    duration: "12 months",
    summary: "The best-value option for year-round access to the full library.",
    badge: "Best Value"
  }
] as const;

const featureHighlights = [
  {
    title: "Teacher-friendly planning",
    description:
      "Lesson plans, schemes of work, assessments, and revision files stay organized in a way that supports weekly teaching."
  },
  {
    title: "Parent-ready search",
    description:
      "Families can quickly search by grade, subject, or resource type without learning a complicated school catalog."
  },
  {
    title: "Unlimited member downloads",
    description:
      "Active members can download the classroom and home-learning resources they need with no extra charge."
  },
  {
    title: "Clear library structure",
    description:
      "Resources stay grouped by level and category so the right materials are easier to find and easier to trust."
  }
] as const;

export function ElimuCoreHome({
  quickLinks,
  schoolLevels,
  categories,
  featuredResources,
  stats
}: HomePageData) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-[#ead8de] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="ELimuCore"
              width={240}
              height={84}
              priority
              className="h-16 w-auto sm:h-20"
            />
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#8b1028] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-[#8b1028] px-5 py-2.5 text-sm font-semibold text-[#8b1028] transition hover:bg-[#8b1028] hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#8b1028] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6e0d20]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="bg-white">
        <section className="mx-auto max-w-[1340px] px-4 py-6 sm:px-6 lg:px-8">
          <HeroGallery />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[#ead8de] bg-white p-6 shadow-[0_18px_40px_rgba(104,20,41,0.08)] sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className={sectionKickerClass}>Search library</p>
                <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Search by grade, subject, or resource type
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  ELimuCore helps teachers plan with confidence and helps
                  parents support learners at home using one clean digital
                  library.
                </p>

                <form
                  action="/resources"
                  className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end"
                >
                  <div className="flex-1">
                    <label
                      htmlFor="homepage-search"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Search resources
                    </label>
                    <input
                      id="homepage-search"
                      name="q"
                      type="text"
                      placeholder="Lesson plans, KCSE papers, Grade 7 exams, revision notes..."
                      className="w-full rounded-2xl border border-[#d9c1c9] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#8b1028]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-2xl bg-[#8b1028] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#6e0d20]"
                  >
                    Search Library
                  </button>
                </form>
              </div>

              <div>
                <p className={sectionKickerClass}>Popular categories</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {categories.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/resources?category=${encodeURIComponent(item.slug)}`}
                      className="rounded-full border border-[#d7b2be] bg-white px-4 py-2 text-sm font-semibold text-[#8b1028] transition hover:bg-[#8b1028] hover:text-white"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="mt-6 rounded-[1.75rem] bg-[#f8eef2] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b1028]">
                    Membership includes
                  </p>
                  <p className="mt-3 text-base leading-7 text-slate-700">
                    One active plan gives full library access, including
                    downloads for teaching, planning, revision, and home
                    learning support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.75rem] border border-[#ead8de] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#8b1028] hover:shadow-[0_20px_40px_rgba(104,20,41,0.08)]"
              >
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8b1028]">
                  ELimuCore
                </p>
                <p className="mt-4 text-4xl font-black tracking-tight text-slate-900">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="about"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className={sectionKickerClass}>About ELimuCore</p>
              <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                A cleaner resource space for teachers, parents, and learners
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                ELimuCore brings together planning resources, revision support,
                assessments, and downloadable learning materials in one white,
                easy-to-use library experience.
              </p>

              <div className="mt-8 grid gap-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="group rounded-[1.75rem] border border-[#ead8de] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#8b1028] hover:bg-[#8b1028] hover:text-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-slate-900 transition group-hover:text-white">
                          {link.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600 transition group-hover:text-white/80">
                          {link.desc}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#f8eef2] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#8b1028] transition group-hover:bg-white group-hover:text-[#8b1028]">
                        {link.badge}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featureHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.75rem] border border-[#ead8de] bg-[#fcf8f9] p-6 transition hover:-translate-y-1 hover:border-[#8b1028] hover:shadow-[0_18px_40px_rgba(104,20,41,0.08)]"
                >
                  <div className="mb-4 h-1 w-16 rounded-full bg-[#8b1028]" />
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="levels"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="max-w-2xl">
            <p className={sectionKickerClass}>School levels</p>
            <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Organized by how schools and families actually search
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Move directly to the right level, then browse lesson plans,
              assessments, past papers, notes, and revision support with less
              clicking around.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {schoolLevels.map((level) => (
              <article
                key={level.slug}
                className="rounded-[1.9rem] border border-[#ead8de] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#8b1028] hover:shadow-[0_20px_40px_rgba(104,20,41,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8eef2] text-lg font-black text-[#8b1028]">
                  {level.title.charAt(0)}
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">
                  {level.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {level.subtitle}
                </p>

                <div className="mt-6 space-y-3">
                  {level.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between rounded-2xl border border-[#efe1e5] bg-[#fcf8f9] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#8b1028] hover:bg-[#8b1028] hover:text-white"
                    >
                      <span>{item.label}</span>
                      <span>&gt;</span>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="membership"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className={sectionKickerClass}>Membership</p>
            <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Straightforward plans with unlimited member access
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              One active plan opens the full ELimuCore library. Download the
              resources you need for classwork, revision, and home support
              while your membership is active.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {membershipPlans.map((plan) => (
              <article
                key={plan.name}
                className="rounded-[1.9rem] border border-[#ead8de] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#8b1028] hover:shadow-[0_22px_44px_rgba(104,20,41,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b1028]">
                    {plan.name}
                  </p>
                  <span className="rounded-full bg-[#f8eef2] px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#8b1028]">
                    {plan.badge}
                  </span>
                </div>

                <p className="font-display mt-6 text-5xl font-black tracking-tight text-[#8b1028]">
                  {plan.price}
                </p>
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                  {plan.duration}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {plan.summary}
                </p>

                <div className="mt-6 rounded-[1.5rem] bg-[#fcf2d8] px-4 py-4 text-sm font-medium leading-6 text-slate-700">
                  Full unlimited access with no extra charge on downloads during
                  the active plan period.
                </div>

                <Link
                  href="/signup"
                  className="mt-6 inline-flex rounded-2xl bg-[#8b1028] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#6e0d20]"
                >
                  Start with this plan
                </Link>
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
              <p className={sectionKickerClass}>Featured resources</p>
              <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Popular with teachers and parents
              </h2>
            </div>
            <Link
              href="/resources"
              className="rounded-xl border border-[#8b1028] px-5 py-3 text-sm font-semibold text-[#8b1028] transition hover:bg-[#8b1028] hover:text-white"
            >
              View all resources
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredResources.map((resource) => (
              <article
                key={resource.slug}
                className="group rounded-[1.9rem] border border-[#ead8de] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#8b1028] hover:bg-[#8b1028] hover:text-white hover:shadow-[0_20px_44px_rgba(104,20,41,0.1)]"
              >
                <div className="inline-flex rounded-full bg-[#f8eef2] px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#8b1028] transition group-hover:bg-white group-hover:text-[#8b1028]">
                  Featured
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900 transition group-hover:text-white">
                  {resource.title}
                </h3>
                <p className="mt-2 text-sm font-semibold text-slate-500 transition group-hover:text-white/80">
                  {resource.meta}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600 transition group-hover:text-white/82">
                  {resource.summary}
                </p>
                <Link
                  href={`/resources/${resource.slug}`}
                  className="mt-6 inline-flex rounded-full px-3 py-2 text-sm font-semibold text-[#8b1028] transition group-hover:bg-white/10 group-hover:text-white hover:bg-white hover:text-[#8b1028]"
                >
                  View resource &gt;
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          id="faq"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="rounded-[2rem] bg-[#8b1028] p-8 text-white shadow-[0_24px_50px_rgba(104,20,41,0.14)]">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/72">
                Support
              </p>
              <h2 className="font-display mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Simple answers for teachers and families
              </h2>
              <p className="mt-4 text-base leading-7 text-white/82">
                We keep the questions that matter most close to the point of
                decision, so new members can understand how the library works
                quickly.
              </p>
            </div>

            <div className="space-y-4">
              {[
                [
                  "How much is membership?",
                  "Membership is KSh 300 for 1 month, KSh 500 for 6 months, or KSh 1000 for 1 year."
                ],
                [
                  "Are there download limits?",
                  "No. Active members can download the resources they need with no extra charge during the plan period."
                ],
                [
                  "Can teachers find classroom files here?",
                  "Yes. ELimuCore is designed to organize lesson plans, schemes of work, assessments, exams, and revision resources in one place."
                ],
                [
                  "Can parents search by grade or subject?",
                  "Yes. Parents can search by school level, grade, subject, or resource type to quickly find useful support materials."
                ]
              ].map(([question, answer]) => (
                <article
                  key={question}
                  className="rounded-[1.75rem] border border-[#ead8de] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#8b1028] hover:shadow-[0_18px_40px_rgba(104,20,41,0.08)]"
                >
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">
                    {question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 bg-[#7d0d24] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-2xl bg-white p-3">
                <Image
                  src={logo}
                  alt="ELimuCore"
                  width={180}
                  height={64}
                  className="h-12 w-auto"
                />
              </div>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/78">
                ELimuCore helps teachers and parents access trusted learning
                materials, classroom support files, and revision resources from
                one clean digital library.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <Link
                href="/resources"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-[#8b1028]"
              >
                Resource Library
              </Link>
              <Link
                href="/account"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-[#8b1028]"
              >
                My Account
              </Link>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-[#8b1028]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#8b1028] transition hover:bg-[#f7d8e0]"
              >
                Sign Up
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-white/15 pt-5 text-sm text-white/72">
            2026 ELimuCore. Built for teachers, parents, and unlimited member
            access.
          </div>
        </div>
      </footer>
    </div>
  );
}
