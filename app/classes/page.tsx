import Link from "next/link";
import type { Metadata } from "next";
import { HighlightHeading } from "@/components/learning/highlight-heading";
import { getLearningClasses } from "@/lib/learning";
import { getCurrentMemberContext } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Classes",
  description:
    "Explore ELimuCore learning classes with guided lessons, child-friendly practice, quizzes, and simple progress support for families and teachers."
};

export default async function ClassesPage() {
  const [classes, memberContext] = await Promise.all([
    getLearningClasses(),
    getCurrentMemberContext()
  ]);

  const availableClasses = classes.filter((item) => item.available);

  return (
    <main className="learning-stage min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="learning-panel mx-auto max-w-7xl overflow-hidden rounded-[2rem]">
        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-14">
          <div className="relative">
            <div className="learning-orb learning-float absolute -left-5 top-0 h-16 w-16" />
            <div className="learning-orb-secondary learning-float-delay absolute right-10 top-14 h-24 w-24" />

            <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
              Learning classes
            </p>
            <div className="mt-4">
              <HighlightHeading
                before="Structured digital"
                highlight="classes"
                after="for children, teachers, and families."
                as="h1"
                className="text-4xl font-black sm:text-5xl"
              />
            </div>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              ELimuCore brings lessons, practice, quizzes, and simple progress
              tracking into one clear learning path. Families and teachers can
              begin with Grade 1 Mathematics and move from one class to the next
              with confidence.
            </p>
            <p className="mt-4 max-w-2xl rounded-2xl border border-amber-200 bg-white/90 px-4 py-3 text-sm font-medium text-stone-700 shadow-sm">
              Free users can explore selected preview lessons. Active members
              open the full class, guided practice, quizzes, and saved progress
              for continued learning.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  value: `${availableClasses.length}`,
                  label: "Classes available now",
                  tone: "bg-[#f7f3ff]"
                },
                {
                  value: `${classes.length}`,
                  label: "Classes available and coming soon",
                  tone: "bg-[#eefbf8]"
                },
                {
                  value: memberContext.activeMembership ? "On" : "Off",
                  label: "Member access status",
                  tone: "bg-[#fff8ea]"
                }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`learning-lift-card rounded-3xl border border-white/70 p-5 shadow-sm ${stat.tone}`}
                >
                  <p className="text-3xl font-black tracking-tight text-[#1b973c]">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="learning-band relative overflow-hidden rounded-[2rem] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="learning-pulse-ring absolute right-6 top-6 h-16 w-16 rounded-full border border-white/20" />
            <div className="learning-orb-gold absolute bottom-2 right-2 h-24 w-24 opacity-80" />

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">
              What each class includes
            </p>
            <div className="mt-6 grid gap-4">
              {[
                "Clear topic paths that help children know what to learn next.",
                "Interactive practice with quick feedback after every answer.",
                "Short quizzes that show how well the lesson was understood.",
                "Saved progress for members so learning can continue later."
              ].map((item) => (
                <div
                  key={item}
                  className="learning-lift-card rounded-2xl border border-white/20 bg-white/15 px-4 py-4 text-sm font-semibold text-white shadow-sm backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/classes/grade-1-math"
                className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
              >
                Open Grade 1 Mathematics
              </Link>
              <Link
                href={memberContext.user ? "/account" : "/signup"}
                className="brand-button-secondary rounded-2xl border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#1b973c]"
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
          <div className="mt-2">
            <HighlightHeading
              before="Choose a"
              highlight="class"
              after="and keep learning with confidence."
              className="text-2xl font-bold"
            />
          </div>
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
                className={`learning-lift-card rounded-[2rem] border p-6 shadow-[var(--shadow-card)] ${
                  learningClass.available
                    ? "border-[#daf5ef] bg-[linear-gradient(180deg,#f3fcf6,#ffffff)]"
                    : "border-stone-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1b973c]">
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

                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {learningClass.subtitle}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {learningClass.description}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-[#f7f3ff] px-4 py-3">
                    <p className="font-black text-slate-900">{topicCount}</p>
                    <p className="mt-1 font-medium text-slate-700">Topics</p>
                  </div>
                  <div className="rounded-2xl bg-[#eefbf8] px-4 py-3">
                    <p className="font-black text-slate-900">{lessonCount}</p>
                    <p className="mt-1 font-medium text-slate-700">Lessons</p>
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
                    <span className="inline-flex rounded-2xl border border-stone-200 px-5 py-3 text-sm font-semibold text-slate-700">
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
