import Link from "next/link";
import { HighlightHeading } from "@/components/learning/highlight-heading";

type PremiumLockProps = {
  title: string;
  loginHref: string;
  signupHref: string;
};

export function PremiumLock({
  title,
  loginHref,
  signupHref
}: PremiumLockProps) {
  return (
    <section className="learning-panel relative overflow-hidden rounded-[2rem] p-8 shadow-[var(--shadow-card)] sm:p-10">
      <div className="learning-orb absolute -left-8 top-8 h-20 w-20" />
      <div className="learning-orb-gold absolute right-8 top-10 h-16 w-16" />
      <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
        Premium lesson
      </p>
      <div className="mt-4">
        <HighlightHeading
          before="Unlock"
          highlight="premium lessons"
          after="today"
          className="text-3xl font-black sm:text-4xl"
        />
      </div>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
        {title}. Sign in to continue or start a membership to unlock the full
        learning path, quizzes, and saved progress.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            name: "1 Month",
            price: "KSh 300",
            detail: "Full access for one month."
          },
          {
            name: "6 Months",
            price: "KSh 500",
            detail: "Full access for six months."
          },
          {
            name: "1 Year",
            price: "KSh 1000",
            detail: "Full access for one year."
          }
        ].map((plan) => (
          <div
            key={plan.name}
            className="learning-lift-card rounded-3xl border border-white/70 bg-white/90 p-5"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              {plan.name}
            </p>
            <p className="mt-3 text-3xl font-black tracking-tight text-[#1b973c]">
              {plan.price}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {plan.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={loginHref}
          className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
        >
          Login to continue
        </Link>
        <Link
          href={signupHref}
          className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
        >
          Create account
        </Link>
      </div>
    </section>
  );
}
