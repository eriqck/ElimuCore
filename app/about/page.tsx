import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ELimuCore",
  description:
    "Learn how ELimuCore supports teachers, parents, and learners in Kenya with schemes, assessments, revision materials, and self-learning tools."
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/60 surface-card p-8 sm:p-10">
        <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
          About ELimuCore
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          One learning platform for teachers, parents, and learners
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
          ELimuCore gives schools and families in Kenya one place for ready
          schemes of work, assessments, revision materials, notes, and
          self-learning junior classes.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">For teachers</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Access ready schemes, assessments, notes, and planning support
              faster.
            </p>
          </article>
          <article className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">For parents</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Support home study with trusted revision materials and guided
              self-learning.
            </p>
          </article>
          <article className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">For learners</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Learn step by step through structured junior classes and revision
              support.
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/classes"
            className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
          >
            Self-Learning Junior Classes
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
