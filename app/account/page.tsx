import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentMemberContext } from "@/lib/membership";

type AccountPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

export const metadata: Metadata = {
  title: "My Account",
  description:
    "View your ELimuCore account details, membership status, and available plans."
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

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = (await searchParams) ?? {};
  const notice =
    typeof params.notice === "string"
      ? decodeURIComponent(params.notice)
      : "";
  const memberContext = await getCurrentMemberContext();

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="surface-card rounded-[2rem] border border-white/60 p-8 shadow-[var(--shadow-soft)] sm:p-10">
          <p className="brand-kicker text-sm font-bold uppercase tracking-[0.22em]">
            My account
          </p>
          <h1 className="font-display mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            ELimuCore membership dashboard
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Manage your member access, see your current plan status, and get
            ready for payment automation later. For now, memberships can be
            activated manually in Supabase while the library experience stays
            fully connected.
          </p>

          {notice ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              {notice}
            </div>
          ) : null}

          {memberContext.user ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Member profile
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      {memberContext.profile?.fullName}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {memberContext.profile?.email}
                    </p>
                  </div>

                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="brand-button-secondary rounded-2xl px-4 py-2 text-sm font-semibold transition"
                    >
                      Sign out
                    </button>
                  </form>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Current access
                  </p>

                  {memberContext.activeMembership ? (
                    <>
                      <p className="mt-3 text-2xl font-black tracking-tight text-rose-900">
                        {memberContext.activeMembership.plan?.name ??
                          "Active membership"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Full unlimited access is active until{" "}
                        {formatDate(memberContext.activeMembership.expiresAt)}.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                        No active membership yet
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Your account is ready. Once a plan is activated, premium
                        downloads will open automatically.
                      </p>
                    </>
                  )}
                </div>

                {memberContext.memberships.length > 0 ? (
                  <div className="mt-6 grid gap-3">
                    {memberContext.memberships.slice(0, 3).map((membership) => (
                      <div
                        key={membership.id}
                        className="rounded-2xl border border-stone-200 bg-white p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">
                            {membership.plan?.name ?? membership.planSlug}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                              membership.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {membership.isActive
                              ? "Active"
                              : membership.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          Starts: {formatDate(membership.startsAt)} | Expires:{" "}
                          {formatDate(membership.expiresAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>

              <section id="plans" className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Available plans
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      Choose the membership you want to activate
                    </h2>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
                    Manual activation for now
                  </span>
                </div>

                <div className="mt-6 grid gap-4">
                  {memberContext.plans.map((plan) => (
                    <article
                      key={plan.slug}
                      className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 transition hover:border-rose-700 hover:bg-rose-900 hover:text-white"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold tracking-tight text-slate-900">
                            {plan.name}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {plan.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black tracking-tight text-amber-700">
                            {formatPrice(plan.priceKes)}
                          </p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                            {plan.durationMonths} month
                            {plan.durationMonths === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-5">
                  <p className="text-sm leading-7 text-slate-600">
                    Before Paystack is connected, we can activate a membership
                    manually from Supabase after payment confirmation. Once
                    activation is done, premium download buttons start working
                    on your account immediately.
                  </p>
                </div>
              </section>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="brand-band rounded-[2rem] p-6 shadow-[var(--shadow-soft)]">
                <h2 className="font-display text-3xl font-black tracking-tight text-white">
                  Sign in to unlock premium downloads
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-100">
                  Your account is the first step. After sign-in, membership can
                  be activated manually now and through Paystack later.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-rose-900 transition hover:bg-amber-400 hover:text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-rose-900"
                  >
                    Create account
                  </Link>
                </div>
              </section>

              <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Membership plans
                </h2>
                <div className="mt-6 grid gap-4">
                  {memberContext.plans.map((plan) => (
                    <article
                      key={plan.slug}
                      className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {plan.name}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {plan.description}
                          </p>
                        </div>
                        <p className="text-xl font-black tracking-tight text-amber-700">
                          {formatPrice(plan.priceKes)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
