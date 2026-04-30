import Link from "next/link";
import type { Metadata } from "next";
import { getLearningClasses } from "@/lib/learning";
import { getCurrentMemberContext } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Classes",
  description:
    "Explore ELimuCore learning classes with guided lessons, interactive practice, quizzes, and member-only progress tracking."
};

export default async function ClassesPage() {
  const [classes, memberContext] = await Promise.all([
    getLearningClasses(),
    getCurrentMemberContext()
  ]);

  const availableClasses = classes.filter((item) => item.available);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/60 surface-card">
        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-14">
          <div>
            <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
              Learning classes
            </p>
            <h1 className="font-display mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Structured digital classes for children, teachers, and families.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              ELimuCore classes bring lessons, practice, quizzes, and learning
              progress into one guided path. Start with Grade 1 Mathematics and
              grow into more classes over time without changing the platform.
            </p>
            <p className="mt-4 max-w-2xl rounded-2xl border border-amber-200 bg-white/85 px-4 py-3 text-sm font-medium text-stone-700 shadow-sm">
              Free users can open selected preview lessons. Active members
              unlock the full class, guided practice, mixed quizzes, and saved
              progress.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  value: `${availableClasses.length}`,
                  label: "Classes available now"
                },
                {
                  value: `${classes.length}`,
                  label: "Classes planned in roadmap"
                },
                {
                  value: memberContext.activeMembership ? "On" : "Off",
                  label: "Member access status"
                }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-stone-200/80 bg-white/80 p-5 shadow-sm"
                >
                  <p className="text-3xl font-black tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mesh-panel rounded-[2rem] border border-rose-100 p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              What each class includes
            </p>
            <div className="mt-6 grid gap-4">
              {[
                "Guided topic pages that show the lesson path clearly.",
                "Interactive practice that gives instant feedback to the learner.",
                "Topic quizzes with score summaries at the end.",
                "Member-only progress saving for logged-in users."
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/70 bg-white/90 px-4 py-4 text-sm font-medium text-slate-700 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/classes/grade-1-math"
                className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Open Grade 1 Mathematics
              </Link>
              <Link
                href={memberContext.user ? "/account" : "/signup"}
                className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
              >
                {memberContext.user ? "View account" : "Create account"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl">
        <div className="mb-6">
          <p className="brand-kicker text-sm font-semibold uppercase tracking-[0.2em]">
            Browse classes
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Start with one polished class, then keep growing the product.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {classes.map((learningClass) => {
            const lessonCount = learningClass.topics.reduce(
              (total, topic) => total + topic.lessons.length,
              0
            );
            const topicCount = learningClass.topics.length;

            return (
              <article
                key={learningClass.slug}
                className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b1028]">
                      {learningClass.statusLabel}
                    </p>
                    <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                      {learningClass.title}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      learningClass.available
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {learningClass.available ? "Live" : "Soon"}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {learningClass.subtitle}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {learningClass.description}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-stone-50 px-4 py-3">
                    <p className="font-black text-slate-900">{topicCount}</p>
                    <p className="mt-1 text-slate-500">Topics</p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 px-4 py-3">
                    <p className="font-black text-slate-900">{lessonCount}</p>
                    <p className="mt-1 text-slate-500">Lessons</p>
                  </div>
                </div>

                <div className="mt-6">
                  {learningClass.available ? (
                    <Link
                      href={`/classes/${learningClass.slug}`}
                      className="brand-button-primary inline-flex rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      Open class
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-2xl border border-stone-200 px-5 py-3 text-sm font-semibold text-slate-500">
                      Coming soon
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
