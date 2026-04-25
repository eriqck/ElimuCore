import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { getSafeRedirectPath } from "@/lib/auth";

type SignupPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create an ELimuCore member account for premium teacher and parent resources."
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = (await searchParams) ?? {};
  const next = getSafeRedirectPath(params.next);
  const error =
    typeof params.error === "string" ? decodeURIComponent(params.error) : "";
  const message =
    typeof params.message === "string"
      ? decodeURIComponent(params.message)
      : "";

  return (
    <AuthShell
      kicker="Create account"
      title="Create your ELimuCore account"
      description="Join ELimuCore to manage your membership and access premium teaching, planning, and revision resources."
      sideTitle="Set up your account once and use it across the whole library"
      sideCopy="Your account gives you one place to manage membership access and open the resources you need for classwork or home support."
      sideItems={[
        "Teachers can keep lesson plans, exams, and classroom files within easy reach.",
        "Parents can access revision materials and home-learning support more easily.",
        "Your membership and downloads stay connected to one account."
      ]}
      footerPrompt="Already have an account?"
      footerHref={`/login?next=${encodeURIComponent(next)}`}
      footerLinkLabel="Sign in instead"
    >
      <div className="grid gap-4">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {message}
          </div>
        ) : null}

        <form action="/auth/signup" method="post" className="grid gap-4">
          <input type="hidden" name="next" value={next} />

          <div>
            <label
              htmlFor="full_name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-700"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-700"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-700"
            />
          </div>

          <button
            type="submit"
            className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Create account
          </button>
        </form>

        <Link
          href="/"
          className="inline-flex w-fit rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-rose-900 hover:text-white"
        >
          Back to homepage
        </Link>
      </div>
    </AuthShell>
  );
}
