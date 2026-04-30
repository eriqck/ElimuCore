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
  title: "Sign Up",
  description: "Create an ELimuCore account."
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
      title="SIGN UP"
    >
      <div className="grid gap-4">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {message}
          </div>
        ) : null}

        <form action="/auth/signup" method="post" className="grid gap-5">
          <input type="hidden" name="next" value={next} />

          <div className="border-b border-stone-300">
            <label htmlFor="full_name" className="sr-only">
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Full name"
              required
              className="w-full border-0 bg-transparent px-1 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="border-b border-stone-300">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              required
              className="w-full border-0 bg-transparent px-1 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="border-b border-stone-300">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              placeholder="Password"
              required
              className="w-full border-0 bg-transparent px-1 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-md bg-[#18b6cf] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1099af]"
          >
            CONTINUE
          </button>
        </form>

        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="inline-flex items-center justify-center rounded-md bg-[#2ab249] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23953d]"
        >
          LOGIN
        </Link>
      </div>
    </AuthShell>
  );
}
