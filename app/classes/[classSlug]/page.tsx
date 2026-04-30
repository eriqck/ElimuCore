import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getLearningClassBySlug,
  getLearningProgressForCurrentUser,
  getLearningTopicProgressSummary
} from "@/lib/learning";
import { getCurrentMemberContext } from "@/lib/membership";

type LearningClassPageProps = {
  params: Promise<{
    classSlug: string;
  }>;
};

export async function generateMetadata({
  params
}: LearningClassPageProps): Promise<Metadata> {
  const { classSlug } = await params;
  const learningClass = await getLearningClassBySlug(classSlug);

  if (!learningClass) {
    return {
      title: "Class not found"
    };
  }

  return {
    title: learningClass.title,
    description: learningClass.description
  };
}

export default async function LearningClassPage({
  params
}: LearningClassPageProps) {
  const { classSlug } = await params;
  const learningClass = await getLearningClassBySlug(classSlug);

  if (!learningClass) {
    notFound();
  }

  const [memberContext, progressMap] = await Promise.all([
    getCurrentMemberContext(),
    getLearningProgressForCurrentUser()
  ]);

  const totalLessons = learningClass.topics.reduce(
    (total, topic) => total + topic.lessons.length,
    0
  );
  const freeLessons = learningClass.topics.flatMap((topic) =>
    topic.lessons.filter((lesson) => lesson.access === "free")
  ).length;

  if (!learningClass.available) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/60 surface-card p-8 shadow-[var(--shadow-soft)] sm:p-10">
          <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
            {learningClass.statusLabel}
          </p>
          <h1 className="font-display mt-4 text-4xl font-black tracking-tight text-slate-900">
            {learningClass.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            {learningClass.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/classes"
              className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Back to classes
            </Link>
            <Link
              href="/signup"
              className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
            >
              Create account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/60 surface-card">
        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-14">
          <div>
            <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
              Learning class
            </p>
            <h1 className="font-display mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {learningClass.title}
            </h1>
            <p className="mt-4 text-xl font-semibold text-slate-700">
              {learningClass.subtitle}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              {learningClass.description}
            </p>
            <p className="mt-4 max-w-2xl rounded-2xl border border-amber-200 bg-white/85 px-4 py-3 text-sm font-medium text-stone-700 shadow-sm">
              {learningClass.audience}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/classes/${learningClass.slug}/${learningClass.topics[0]?.slug ?? ""}`}
                className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Start class
              </Link>
              <Link
                href="/classes"
                className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
              >
                All classes
              </Link>
            </div>
          </div>

          <div className="mesh-panel rounded-[2rem] border border-rose-100 p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  value: `${learningClass.topics.length}`,
                  label: "Topics in this class"
                },
                {
                  value: `${totalLessons}`,
                  label: "Structured lessons"
                },
                {
                  value: `${freeLessons}`,
                  label: "Free preview lessons"
                },
                {
                  value: memberContext.activeMembership ? "Active" : "Locked",
                  label: "Premium lesson status"
                }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm"
                >
                  <p className="text-3xl font-black tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="brand-kicker text-sm font-semibold uppercase tracking-[0.2em]">
              Topics
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Build skill one topic at a time
            </h2>
          </div>
          <Link
            href="/account"
            className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-rose-900 hover:text-white"
          >
            View membership
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {learningClass.topics.map((topic) => {
            const summary = getLearningTopicProgressSummary(topic, progressMap);
            const premiumLessons = topic.lessons.filter(
              (lesson) => lesson.access === "premium"
            ).length;

            return (
              <article
                key={topic.slug}
                className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {topic.lessons.filter((lesson) => lesson.access === "free").length}{" "}
                    free lesson
                  </span>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    {premiumLessons} premium lessons
                  </span>
                </div>

                <h3 className="mt-5 text-3xl font-black tracking-tight text-slate-900">
                  {topic.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  {topic.summary}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {topic.description}
                </p>

                <div className="mt-6 rounded-3xl bg-stone-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Progress
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {summary.completedLessons} / {summary.totalLessons} lessons
                    </p>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-[#31b8a7]"
                      style={{ width: `${Math.max(summary.percent, 4)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/classes/${learningClass.slug}/${topic.slug}`}
                    className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Open topic
                  </Link>
                  <Link
                    href={`/lessons/${topic.slug}/${topic.lessons[0]?.slug ?? ""}`}
                    className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
                  >
                    Start free lesson
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
