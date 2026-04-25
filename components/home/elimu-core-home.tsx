import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/weblogo.png";
import zoomArtwork from "@/assets/zoom.png";
import { HeroGallery } from "@/components/home/hero-gallery";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "#package" },
  { label: "Product", href: "#package" },
  { label: "Pricing", href: "#plans" },
  { label: "Support", href: "#how-to-use" },
  { label: "Blog", href: "/resources" }
] as const;

const howToSteps = [
  {
    step: "1",
    title: "Registration",
    description:
      "Create your ELimuCore account, sign in, and open your membership dashboard."
  },
  {
    step: "2",
    title: "Choose plan",
    description:
      "Select the 1 month, 6 months, or 1 year access plan that matches your needs."
  },
  {
    step: "3",
    title: "Access library",
    description:
      "Browse by grade, subject, or resource type and open the files you need faster."
  },
  {
    step: "4",
    title: "Download files",
    description:
      "With an active membership, download lesson plans, exams, notes, and revision papers without extra charges."
  }
] as const;

const membershipPlans = [
  {
    name: "1 Month",
    price: "KSh 300",
    detail:
      "Full unlimited access for one month. Membership expires after 1 month.",
    icon: PlanStarterIcon
  },
  {
    name: "6 Months",
    price: "KSh 500",
    detail:
      "Full unlimited access for six months. Membership expires after 6 months.",
    icon: PlanGrowthIcon
  },
  {
    name: "1 Year",
    price: "KSh 1000",
    detail:
      "Full unlimited access for one year. Membership expires after 1 year.",
    icon: PlanProIcon
  }
] as const;

function ActionButton({
  href,
  label
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center overflow-hidden rounded-md bg-[#f4a621] text-white shadow-[0_12px_24px_rgba(244,166,33,0.28)] transition hover:-translate-y-0.5 hover:bg-[#df9317]"
    >
      <span className="px-5 py-3 text-sm font-bold sm:px-6 sm:py-4 sm:text-base">
        {label}
      </span>
      <span className="border-l border-white/20 px-4 py-3 text-xl font-black sm:px-5 sm:py-4 sm:text-2xl">
        &gt;
      </span>
    </Link>
  );
}

function PlanStarterIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className="h-8 w-8"
      aria-hidden="true"
    >
      <rect
        x="14"
        y="17"
        width="36"
        height="30"
        rx="4"
        stroke="#32b8a8"
        strokeWidth="2.5"
      />
      <path d="M21 26h22" stroke="#32b8a8" strokeWidth="2.5" />
      <path d="M21 33h14" stroke="#f4a621" strokeWidth="2.5" />
      <circle cx="42" cy="34" r="7" stroke="#f4a621" strokeWidth="2.5" />
      <path d="M42 30v4l3 2" stroke="#f4a621" strokeWidth="2.5" />
    </svg>
  );
}

function PlanGrowthIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className="h-8 w-8"
      aria-hidden="true"
    >
      <rect
        x="13"
        y="15"
        width="38"
        height="34"
        rx="4"
        stroke="#32b8a8"
        strokeWidth="2.5"
      />
      <path d="M20 24h24" stroke="#32b8a8" strokeWidth="2.5" />
      <path d="M20 31h12" stroke="#f4a621" strokeWidth="2.5" />
      <path d="m23 43 7-7 5 5 10-11" stroke="#f4a621" strokeWidth="2.5" />
      <path d="M43 30h6v6" stroke="#f4a621" strokeWidth="2.5" />
    </svg>
  );
}

function PlanProIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className="h-8 w-8"
      aria-hidden="true"
    >
      <rect
        x="14"
        y="16"
        width="36"
        height="32"
        rx="4"
        stroke="#32b8a8"
        strokeWidth="2.5"
      />
      <path d="M22 24h20" stroke="#32b8a8" strokeWidth="2.5" />
      <path
        d="m24 39 5-10 4 7 4-5 3 8 4-6"
        stroke="#f4a621"
        strokeWidth="2.5"
      />
      <circle cx="45" cy="21" r="7" stroke="#f4a621" strokeWidth="2.5" />
      <path d="m45 16 1.8 3.5 3.7.5-2.7 2.7.7 3.8-3.5-1.8-3.5 1.8.7-3.8-2.7-2.7 3.7-.5L45 16Z" fill="#f4a621" />
    </svg>
  );
}

export function ElimuCoreHome() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-[#ececec] bg-white">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0">
            <Image
              src={logo}
              alt="ELimuCore"
              width={248}
              height={74}
              priority
              className="h-12 w-auto sm:h-14"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#8b1028] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md bg-[#24bba7] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#179785]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-[#8d4db2] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7a3f9e]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="bg-white">
        <HeroGallery />

        <section
          id="package"
          className="px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm text-slate-400">
              ELimuCore for schools and families
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
              One membership.
              <span className="text-[#31b8a7]">
                {" "}
                Complete resource access for teaching and home study.
              </span>
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-5xl px-2 py-4 lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                ELimuCore Complete Resource Library
              </h3>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Teachers and parents can access lesson plans, schemes of work,
                past papers, marking schemes, exams, notes, assignments, and
                home-learning materials from one clean member library.
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Subscription options are KSh 300 for 1 month, KSh 500 for 6
                months, and KSh 1000 for 1 year.
              </p>
              <p className="mt-4 text-base font-semibold text-slate-700">
                Your subscription has no limitations, so you download all the
                resources you need without extra charges during the active
                period.
              </p>

              <div className="mt-8">
                <ActionButton href="/signup" label="Request Access" />
              </div>
            </div>

            <div className="relative mt-10 flex justify-center lg:mt-0">
              <div className="relative h-[320px] w-full max-w-[620px] sm:h-[380px] lg:h-[440px]">
                <Image
                  src={zoomArtwork}
                  alt="Teacher supporting learners through an online lesson"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-contain object-center scale-[1.12]"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-to-use"
          className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl font-medium tracking-tight text-slate-900">
            How to <span className="text-[#31b8a7]">use</span>
          </h2>

          <div className="mt-12 grid gap-8 lg:grid-cols-4 lg:gap-5">
            {howToSteps.map((item, index) => (
              <div key={item.step} className="text-left">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#31b8a7] text-sm font-bold text-white">
                    {item.step}
                  </span>
                  <span className="h-[2px] flex-1 bg-[#31b8a7]" />
                </div>

                <h3 className="mt-6 text-3xl font-medium tracking-tight text-slate-900">
                  {item.title}
                  {index < howToSteps.length - 1 ? " ->" : ""}
                </h3>
                <p className="mt-5 text-lg leading-9 text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="plans"
          className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl font-medium tracking-tight text-slate-900">
            ELimuCore <span className="text-[#31b8a7]">membership plans</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-500">
            One active membership lets you download all the resources you need
            for classroom planning, revision, and home support with no extra
            charge during the subscription period.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {membershipPlans.map((plan) => {
              const Icon = plan.icon;

              return (
                <article
                  key={plan.name}
                  className="border border-[#efefef] bg-white px-8 py-10 shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#dff4ef] bg-[#fbfffe]">
                    <Icon />
                  </div>
                  <h3 className="mt-6 text-2xl font-medium tracking-tight text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="mt-3 text-4xl font-black tracking-tight text-[#8b1028]">
                    {plan.price}
                  </p>
                  <p className="mt-4 text-base leading-8 text-slate-500">
                    {plan.detail}
                  </p>

                  <div className="mt-8">
                    <ActionButton href="/signup" label="Choose Plan" />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer
        id="footer"
        className="border-t border-[#ececec] bg-white px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-[1360px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={logo}
              alt="ELimuCore"
              width={180}
              height={58}
              className="h-12 w-auto"
            />
            <p className="max-w-xl text-sm leading-7 text-slate-500">
              ELimuCore gives teachers and parents one clear digital space for
              member access, learning resources, revision materials, and
              classroom planning support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/resources"
              className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#8b1028] hover:text-white"
            >
              Resources
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-[#24bba7] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#179785]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-[#8d4db2] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#7a3f9e]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
