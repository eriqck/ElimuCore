import type { Metadata } from "next";
import Link from "next/link";

const supportSteps = [
  "Create your ELimuCore account",
  "Choose a membership plan",
  "Open self-learning classes, Scheme Bot, or premium materials",
  "Download or use the tools you need"
] as const;

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help using ELimuCore membership, resources, self-learning classes, and Scheme Bot."
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/60 surface-card p-8 sm:p-10">
        <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
          Support
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Getting started with ELimuCore
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
          Use ELimuCore to access premium materials, self-learning junior
          classes, and Scheme Bot support with a clear step-by-step flow.
        </p>

        <div className="mt-8 grid gap-4">
          {supportSteps.map((step, index) => (
            <article
              key={step}
              className="flex items-start gap-4 rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25b24a] text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="pt-1 text-base font-medium text-slate-800">{step}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
          >
            Login
          </Link>
          <Link
            href="/scheme-bot"
            className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
          >
            Open Scheme Bot
          </Link>
        </div>
      </section>
    </main>
  );
}
