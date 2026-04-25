import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { getSafeRedirectPath } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Member Login",
  description:
    "Sign in to ELimuCore to access premium teaching and parent support resources."
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
      kicker="Member access"
      title="Sign in to your ELimuCore account"
      description="Access premium downloads, check your membership status, and keep your teaching or family support resources in one place."
      sideTitle="One login, one library, full member access"
      sideCopy="Use your ELimuCore account to reach premium downloads and manage your current membership from one clean dashboard."
      sideItems={[
        "Premium resources stay protected behind your member account.",
        "Active members can download classroom and home-support files with no extra charge.",
        "Paystack can be added later without rebuilding the library experience."
      ]}
      footerPrompt="Need an account?"
      footerHref={`/signup?next=${encodeURIComponent(next)}`}
      footerLinkLabel="Create one here"
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

        <form action="/auth/login" method="post" className="grid gap-4">
          <input type="hidden" name="next" value={next} />

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
              required
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-700"
            />
          </div>

          <button
            type="submit"
            className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Sign in
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
