import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  canAccessLearningItem,
  getLearningProgressForCurrentUser,
  getLearningTopicBySlugs,
  getLearningTopicProgressSummary
} from "@/lib/learning";
import { getCurrentMemberContext } from "@/lib/membership";

type TopicPageProps = {
  params: Promise<{
    classSlug: string;
    topicSlug: string;
  }>;
};

export async function generateMetadata({
  params
}: TopicPageProps): Promise<Metadata> {
  const { classSlug, topicSlug } = await params;
  const result = await getLearningTopicBySlugs(classSlug, topicSlug);

  if (!result) {
    return {
      title: "Topic not found"
    };
  }

  return {
    title: result.topic.title,
    description: result.topic.description
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { classSlug, topicSlug } = await params;
  const result = await getLearningTopicBySlugs(classSlug, topicSlug);

  if (!result) {
    notFound();
  }

  const { learningClass, topic } = result;
  const [memberContext, progressMap] = await Promise.all([
    getCurrentMemberContext(),
    getLearningProgressForCurrentUser()
  ]);
  const hasMembership = Boolean(memberContext.activeMembership);
  const summary = getLearningTopicProgressSummary(topic, progressMap);
  const loginHref = `/login?next=${encodeURIComponent(
    `/classes/${learningClass.slug}/${topic.slug}`
  )}`;
  const signupHref = `/signup?next=${encodeURIComponent(
    `/classes/${learningClass.slug}/${topic.slug}`
  )}`;

  return (
    <main className="learning-stage min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="learning-panel relative mx-auto max-w-7xl overflow-hidden rounded-[2rem]">
        <div className="absolute left-6 top-12 h-20 w-20 rounded-full bg-[#31b8a7]/10 blur-2xl" />
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#8d4db2]/10 blur-3xl" />

        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-14">
          <div>
            <span className="inline-flex rounded-full bg-[#8b1028] px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-[0_14px_30px_rgba(139,16,40,0.22)]">
              {learningClass.title}
            </span>
            <h1 className="font-display mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {topic.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              {topic.summary}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {topic.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/lessons/${topic.slug}/${topic.lessons[0]?.slug ?? ""}`}
                className="rounded-2xl bg-[#f3a61a] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(243,166,26,0.28)] transition hover:-translate-y-0.5 hover:bg-[#de9516]"
              >
                Start free lesson
              </Link>
              <Link
                href={`/classes/${learningClass.slug}`}
                className="rounded-2xl border border-[#8b1028]/15 bg-white px-5 py-3 text-sm font-semibold text-[#8b1028] transition hover:bg-[#8b1028] hover:text-white"
              >
                Back to class
              </Link>
            </div>
          </div>

          <div className="learning-band relative overflow-hidden rounded-[2rem] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="absolute bottom-8 left-8 h-24 w-24 rounded-full bg-[#31b8a7]/20 blur-2xl" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  value: `${topic.lessons.length}`,
                  label: "Lessons in this topic"
                },
                {
                  value: `${summary.percent}%`,
                  label: "Topic progress"
                },
                {
                  value: hasMembership ? "Unlocked" : "Preview only",
                  label: "Member access"
                },
                {
                  value: `${topic.lessons.filter((lesson) => lesson.access === "free").length}`,
                  label: "Free lessons"
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

            {!hasMembership ? (
              <div className="mt-6 rounded-3xl border border-white/15 bg-white/10 px-5 py-5 text-sm leading-6 text-white/90 backdrop-blur">
                Open the free lesson now, then sign in with an active
                membership to unlock the rest of the topic and save progress.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="brand-kicker text-sm font-semibold uppercase tracking-[0.2em]">
              Lesson path
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Move through the topic step by step
            </h2>
          </div>
          {!memberContext.user ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href={loginHref}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-[#8b1028] hover:text-white"
              >
                Login
              </Link>
              <Link
                href={signupHref}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-[#8b1028] hover:text-white"
              >
                Sign up
              </Link>
            </div>
          ) : null}
        </div>

        <div className="grid gap-6">
          {topic.lessons.map((lesson, index) => {
            const lessonProgress = progressMap[lesson.slug] ?? null;
            const canAccess = canAccessLearningItem(lesson.access, hasMembership);

            return (
              <article
                key={lesson.slug}
                className="learning-lift-card relative overflow-hidden rounded-[2rem] border border-[#eddce2] bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <div className="absolute -right-10 top-0 h-24 w-24 rounded-full bg-[#8d4db2]/10 blur-2xl" />

                <div className="grid gap-6 lg:grid-cols-[0.15fr_0.85fr] lg:items-start">
                  <div className="learning-float flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#31b8a7,#8d4db2)] text-xl font-black text-white shadow-[0_14px_28px_rgba(49,184,167,0.22)]">
                    {index + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          lesson.access === "free"
                            ? "bg-[#e9fbf8] text-[#13806f]"
                            : "bg-[#fff0f4] text-[#8b1028]"
                        }`}
                      >
                        {lesson.access === "free" ? "Free lesson" : "Premium lesson"}
                      </span>
                      <span className="rounded-full bg-[#fff8ea] px-3 py-1 text-xs font-semibold text-[#b37207]">
                        {lesson.estimatedMinutes} min
                      </span>
                      <span className="rounded-full bg-[#f7f3ff] px-3 py-1 text-xs font-semibold text-[#724795]">
                        {lesson.lessonType}
                      </span>
                      {lessonProgress?.completed ? (
                        <span className="rounded-full bg-[#e9fbf8] px-3 py-1 text-xs font-semibold text-[#13806f]">
                          Completed
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
                      {lesson.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">
                      {lesson.summary}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {lesson.objectives.map((objective, objectiveIndex) => (
                        <div
                          key={objective}
                          className={`rounded-2xl px-4 py-4 text-sm font-medium ${
                            objectiveIndex % 2 === 0
                              ? "bg-[#eefbf8] text-[#155c54]"
                              : "bg-[#f7f3ff] text-[#5f3c83]"
                          }`}
                        >
                          {objective}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/lessons/${topic.slug}/${lesson.slug}`}
                        className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      >
                        {lessonProgress?.completed ? "Open again" : "Open lesson"}
                      </Link>
                      {!canAccess ? (
                        <span className="rounded-2xl border border-[#f3d9ab] bg-[#fff8ea] px-5 py-3 text-sm font-semibold text-stone-700">
                          Membership required
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
