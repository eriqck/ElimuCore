import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    email?: string;
    error?: string;
    message?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Enter your ELimuCore OTP code and set a new password.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const params = (await searchParams) ?? {};
  const email =
    typeof params.email === "string" ? decodeURIComponent(params.email) : "";
  const error =
    typeof params.error === "string" ? decodeURIComponent(params.error) : "";
  const message =
    typeof params.message === "string"
      ? decodeURIComponent(params.message)
      : "";

  return (
    <AuthShell title="RESET PASSWORD">
      <div className="grid gap-4">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {message}
          </div>
        ) : null}

        <form action="/auth/reset-password" method="post" className="grid gap-5">
          <div className="border-b border-stone-300">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={email}
              placeholder="Email address"
              required
              className="w-full border-0 bg-transparent px-1 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="border-b border-stone-300">
            <label htmlFor="otp" className="sr-only">
              OTP code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              required
              className="w-full border-0 bg-transparent px-1 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="border-b border-stone-300">
            <label htmlFor="password" className="sr-only">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              placeholder="New password"
              required
              className="w-full border-0 bg-transparent px-1 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="border-b border-stone-300">
            <label htmlFor="confirm_password" className="sr-only">
              Confirm password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              minLength={8}
              placeholder="Confirm password"
              required
              className="w-full border-0 bg-transparent px-1 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-md bg-[#18b6cf] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1099af]"
          >
            UPDATE PASSWORD
          </button>
        </form>

        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center rounded-md bg-[#2ab249] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23953d]"
        >
          REQUEST NEW CODE
        </Link>
      </div>
    </AuthShell>
  );
}
