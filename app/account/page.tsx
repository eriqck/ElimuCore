import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentMemberContext } from "@/lib/membership";

type AccountPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

type SectionLabelProps = {
  children: React.ReactNode;
};

type PlanCardProps = {
  name: string;
  price: string;
  duration: string;
  description: string;
  cta: React.ReactNode;
  active?: boolean;
  featured?: boolean;
};

export const metadata: Metadata = {
  title: "My Account",
  description:
    "Manage your ELimuCore membership and premium learning access."
};

function formatPrice(priceKes: number) {
  return `KSh ${priceKes.toLocaleString("en-US")}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium"
  }).format(new Date(value));
}

function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">
      {children}
    </p>
  );
}

function PlanCard({
  name,
  price,
  duration,
  description,
  cta,
  active,
  featured
}: PlanCardProps) {
  return (
    <article
      className={`w-full rounded-[1.75rem] border p-5 text-left transition ${
        active
          ? "border-emerald-400 bg-emerald-50 shadow-[0_10px_24px_rgba(34,197,94,0.12)]"
          : featured
            ? "border-emerald-300 bg-emerald-50 shadow-[0_8px_20px_rgba(34,197,94,0.10)]"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-xl font-bold tracking-tight text-slate-950">
            {name}
          </h4>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>

        {active ? (
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
            Active
          </span>
        ) : featured ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">
            Popular
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-extrabold tracking-tight text-slate-950">
            {price}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
            {duration}
          </p>
        </div>

        <div className="shrink-0">{cta}</div>
      </div>
    </article>
  );
}

function PlanAction({
  planSlug,
  memberContext,
  activeMembership,
  activePlanSlug,
  featured
}: {
  planSlug: string;
  memberContext: Awaited<ReturnType<typeof getCurrentMemberContext>>;
  activeMembership: Awaited<ReturnType<typeof getCurrentMemberContext>>["activeMembership"];
  activePlanSlug: string | null;
  featured?: boolean;
}) {
  const buttonClassName = `rounded-full px-4 py-2 text-sm font-semibold transition ${
    featured
      ? "bg-emerald-500 text-white hover:bg-emerald-600"
      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
  }`;

  if (!memberContext.user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent("/account")}`}
        className={buttonClassName}
      >
        Login
      </Link>
    );
  }

  if (activeMembership) {
    return (
      <span
        className={`rounded-full px-4 py-2 text-sm font-semibold ${
          activePlanSlug === planSlug
            ? "bg-emerald-600 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {activePlanSlug === planSlug ? "Current plan" : "Locked while active"}
      </span>
    );
  }

  return (
    <form action="/api/paystack/initialize" method="post">
      <input type="hidden" name="plan_slug" value={planSlug} />
      <button type="submit" className={buttonClassName}>
        Pay now
      </button>
    </form>
  );
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = (await searchParams) ?? {};
  const notice =
    typeof params.notice === "string" ? decodeURIComponent(params.notice) : "";
  const memberContext = await getCurrentMemberContext();

  const activeMembership = memberContext.activeMembership;
  const progressPercent = activeMembership ? 100 : 18;
  const membershipTitle = activeMembership
    ? activeMembership.plan?.name ?? "Premium active"
    : "Premium locked";
  const membershipBody = activeMembership
    ? `Active until ${formatDate(activeMembership.expiresAt)}.`
    : "Pick a plan to unlock premium lessons and member resources.";
  const activePlanSlug = activeMembership?.planSlug ?? null;

  const planDescriptions: Record<string, string> = {
    "1-month": "Unlimited access for one month",
    "6-months": "Best for steady learning",
    "1-year": "Best value for long-term access"
  };

  const plans = memberContext.plans.map((plan) => ({
    slug: plan.slug,
    name: plan.name,
    price: formatPrice(plan.priceKes),
    duration: `${plan.durationMonths} month${plan.durationMonths === 1 ? "" : "s"}`,
    description: planDescriptions[plan.slug] ?? plan.description,
    featured: plan.slug === "6-months"
  }));

  return (
    <main className="min-h-screen bg-[#f8f8f6] px-5 py-10 text-slate-950 lg:px-8 lg:py-14">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <SectionLabel>My Account</SectionLabel>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Your ElimuCore account
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Manage your membership and unlock premium learning resources.
          </p>
        </div>

        {notice ? (
          <div className="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <SectionLabel>
                  {memberContext.user ? "Your Profile" : "Account Access"}
                </SectionLabel>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                  {memberContext.user
                    ? memberContext.profile?.fullName
                    : "Sign in to continue"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {memberContext.user
                    ? memberContext.profile?.email
                    : "Login to manage membership and premium access."}
                </p>
              </div>

              {memberContext.user ? (
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Login
                </Link>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <SectionLabel>Membership Status</SectionLabel>
              <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
                {membershipTitle}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {membershipBody}
              </p>

              <div className="mt-5 flex items-center gap-3">
                <div className="h-2.5 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2.5 rounded-full bg-emerald-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {progressPercent}%
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-2xl font-bold tracking-tight text-slate-950">
                  0
                </p>
                <p className="mt-1 text-sm text-slate-500">Downloads</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-2xl font-bold tracking-tight text-slate-950">
                  0
                </p>
                <p className="mt-1 text-sm text-slate-500">Saved items</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <SectionLabel>Membership Plans</SectionLabel>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  Pick your plan
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Simple pricing. Full access while active.
                </p>
              </div>

              <div className="hidden rounded-full bg-amber-100 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700 sm:block">
                Secure checkout
              </div>
            </div>

            <div className="space-y-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.slug}
                  name={plan.name}
                  price={plan.price}
                  duration={plan.duration}
                  description={plan.description}
                  featured={plan.featured}
                  active={activePlanSlug === plan.slug}
                  cta={
                    <PlanAction
                      planSlug={plan.slug}
                      memberContext={memberContext}
                      activeMembership={activeMembership}
                      activePlanSlug={activePlanSlug}
                      featured={plan.featured}
                    />
                  }
                />
              ))}
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm leading-7 text-slate-600">
                Pay with card, bank, or mobile money. Premium access opens automatically after confirmation.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
