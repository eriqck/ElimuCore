import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HighlightHeading } from "@/components/learning/highlight-heading";
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
        <div className="learning-orb absolute left-6 top-12 h-20 w-20" />
        <div className="learning-orb-secondary absolute right-0 top-0 h-44 w-44 sm:h-56 sm:w-56" />

        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-14">
          <div>
            <span className="learning-hero-chip text-sm font-semibold uppercase tracking-[0.16em]">
              {learningClass.title}
            </span>
            <div className="mt-5">
              <HighlightHeading
                before="Learn"
                highlight={topic.title}
                after="step by step"
                as="h1"
                className="text-4xl font-black sm:text-5xl"
              />
            </div>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              {topic.summary}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {topic.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/lessons/${topic.slug}/${topic.lessons[0]?.slug ?? ""}`}
                className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
              >
                Start free lesson
              </Link>
              <Link
                href={`/classes/${learningClass.slug}`}
                className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
              >
                Back to class
              </Link>
            </div>
          </div>

          <div className="learning-band relative overflow-hidden rounded-[2rem] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="learning-orb-gold absolute bottom-8 left-8 h-20 w-20" />
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
                  label: "Access today"
                },
                {
                  value: `${topic.lessons.filter((lesson) => lesson.access === "free").length}`,
                  label: "Free lessons"
                }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="learning-band-card learning-lift-card rounded-3xl p-5"
                >
                  <p className="text-3xl font-black tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{stat.label}</p>
                </div>
              ))}
            </div>

            {!hasMembership ? (
              <div className="learning-band-note mt-6 rounded-3xl px-5 py-5 text-sm font-medium leading-6">
                Start with the free lesson now, then sign in with an active
                membership to continue through the rest of the topic and keep
                progress saved.
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
            <div className="mt-2">
              <HighlightHeading
                before="Move through the"
                highlight="lesson path"
                after="step by step"
                className="text-2xl font-bold"
              />
            </div>
          </div>
          {!memberContext.user ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href={loginHref}
                className="learning-outline-button rounded-full px-4 py-2 text-sm font-semibold transition"
              >
                Login
              </Link>
              <Link
                href={signupHref}
                className="learning-outline-button rounded-full px-4 py-2 text-sm font-semibold transition"
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
                className="learning-lift-card relative overflow-hidden rounded-[2rem] border border-[#daf5ef] bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <div className="learning-orb-secondary absolute -right-6 top-3 h-20 w-20 opacity-75" />

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
                            : "bg-[#fff8ea] text-[#b37207]"
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
                    <p className="mt-3 text-base leading-7 text-slate-700">
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
                          Full access needed
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
