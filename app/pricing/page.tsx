import type { Metadata } from "next";
import Link from "next/link";

const plans = [
  {
    name: "1 Month",
    price: "KSh 299",
    detail: "Full unlimited access for one month."
  },
  {
    name: "6 Months",
    price: "KSh 499",
    detail: "Full unlimited access for six months."
  },
  {
    name: "1 Year",
    price: "KSh 999",
    detail: "Full unlimited access for one year."
  }
] as const;

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "See ELimuCore membership pricing for teachers and parents in Kenya."
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/60 surface-card p-8 sm:p-10">
        <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
          Pricing
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Simple ELimuCore membership plans
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
          One active membership gives teachers and parents full access to
          schemes, assessments, revision materials, and premium learning tools.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
              <p className="mt-3 text-4xl font-black tracking-tight text-[#8b1028]">
                {plan.price}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {plan.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/account"
            className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
          >
            Go to Membership
          </Link>
          <Link
            href="/signup"
            className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
          >
            Create Account
          </Link>
        </div>
      </section>
    </main>
  );
}
