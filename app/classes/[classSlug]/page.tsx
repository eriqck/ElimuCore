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
      <main className="learning-stage min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <div className="learning-panel mx-auto max-w-4xl rounded-[2rem] p-8 shadow-[var(--shadow-soft)] sm:p-10">
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
    <main className="learning-stage min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="learning-panel relative mx-auto max-w-7xl overflow-hidden rounded-[2rem]">
        <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-[#31b8a7]/12 blur-2xl" />
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-[#8d4db2]/10 blur-3xl" />

        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-14">
          <div className="relative">
            <span className="inline-flex rounded-full bg-[#8b1028] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(139,16,40,0.22)]">
              Learning class
            </span>
            <h1 className="font-display mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {learningClass.title}
            </h1>
            <p className="mt-4 text-xl font-semibold text-[#31b8a7]">
              {learningClass.subtitle}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              {learningClass.description}
            </p>
            <p className="mt-4 max-w-2xl rounded-3xl border border-[#f3d9ab] bg-[#fff8ea] px-4 py-4 text-sm font-medium text-stone-700 shadow-sm">
              {learningClass.audience}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/classes/${learningClass.slug}/${learningClass.topics[0]?.slug ?? ""}`}
                className="rounded-2xl bg-[#f3a61a] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(243,166,26,0.28)] transition hover:-translate-y-0.5 hover:bg-[#de9516]"
              >
                Start class
              </Link>
              <Link
                href="/classes"
                className="rounded-2xl border border-[#8b1028]/15 bg-white px-5 py-3 text-sm font-semibold text-[#8b1028] transition hover:bg-[#8b1028] hover:text-white"
              >
                All classes
              </Link>
            </div>
          </div>

          <div className="learning-band relative overflow-hidden rounded-[2rem] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="learning-pulse-ring absolute right-6 top-6 h-16 w-16 rounded-full border border-white/20" />
            <div className="absolute bottom-8 left-6 h-24 w-24 rounded-full bg-[#31b8a7]/20 blur-2xl" />
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
                  className="learning-lift-card rounded-3xl border border-white/15 bg-white/10 p-5 shadow-sm backdrop-blur"
                >
                  <p className="text-3xl font-black tracking-tight text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-rose-50/85">{stat.label}</p>
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
              Build confidence one topic at a time
            </h2>
          </div>
          <Link
            href="/account"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-[#8b1028] hover:text-white"
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
                className="learning-lift-card relative overflow-hidden rounded-[2rem] border border-[#eddce2] bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <div className="absolute -right-12 top-0 h-28 w-28 rounded-full bg-[#8d4db2]/10 blur-2xl" />

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#e9fbf8] px-3 py-1 text-xs font-semibold text-[#13806f]">
                    {topic.lessons.filter((lesson) => lesson.access === "free").length}{" "}
                    free lesson
                  </span>
                  <span className="rounded-full bg-[#fff0f4] px-3 py-1 text-xs font-semibold text-[#8b1028]">
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

                <div className="mt-6 rounded-3xl border border-stone-200 bg-[linear-gradient(135deg,#fff7ea,#ffffff)] p-5">
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
                      className="h-full rounded-full bg-[linear-gradient(90deg,#31b8a7,#8d4db2)] transition-all"
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
                    className="rounded-2xl border border-[#31b8a7]/20 bg-[#eefbf8] px-5 py-3 text-sm font-semibold text-[#13806f] transition hover:bg-[#31b8a7] hover:text-white"
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
