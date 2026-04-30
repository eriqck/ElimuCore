import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LessonPlayer } from "@/components/learning/lesson-player";
import { PremiumLock } from "@/components/learning/premium-lock";
import {
  canAccessLearningItem,
  getLearningLessonBySlugs,
  getLearningProgressForCurrentUser
} from "@/lib/learning";
import { getCurrentMemberContext } from "@/lib/membership";

type LessonPageProps = {
  params: Promise<{
    topicSlug: string;
    lessonSlug: string;
  }>;
};

export async function generateMetadata({
  params
}: LessonPageProps): Promise<Metadata> {
  const { topicSlug, lessonSlug } = await params;
  const result = await getLearningLessonBySlugs(topicSlug, lessonSlug);

  if (!result) {
    return {
      title: "Lesson not found"
    };
  }

  return {
    title: result.lesson.title,
    description: result.lesson.description
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { topicSlug, lessonSlug } = await params;
  const result = await getLearningLessonBySlugs(topicSlug, lessonSlug);

  if (!result) {
    notFound();
  }

  const { learningClass, topic, lesson } = result;
  const [memberContext, progressMap] = await Promise.all([
    getCurrentMemberContext(),
    getLearningProgressForCurrentUser()
  ]);
  const hasMembership = Boolean(memberContext.activeMembership);
  const canAccess = canAccessLearningItem(lesson.access, hasMembership);
  const topicHref = `/classes/${learningClass.slug}/${topic.slug}`;
  const currentPath = `/lessons/${topic.slug}/${lesson.slug}`;
  const loginHref = `/login?next=${encodeURIComponent(currentPath)}`;
  const signupHref = `/signup?next=${encodeURIComponent(currentPath)}`;
  const lessonIndex = topic.lessons.findIndex((item) => item.slug === lesson.slug);
  const nextLesson = topic.lessons[lessonIndex + 1] ?? null;
  const nextLessonHref = nextLesson
    ? `/lessons/${topic.slug}/${nextLesson.slug}`
    : null;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/60 surface-card p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
          <Link
            href="/classes"
            className="transition hover:text-[#8b1028]"
          >
            Classes
          </Link>
          <span>/</span>
          <Link
            href={`/classes/${learningClass.slug}`}
            className="transition hover:text-[#8b1028]"
          >
            {learningClass.title}
          </Link>
          <span>/</span>
          <Link href={topicHref} className="transition hover:text-[#8b1028]">
            {topic.title}
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              lesson.access === "free"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {lesson.access === "free" ? "Free lesson" : "Premium lesson"}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
            {lesson.lessonType}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
            {lesson.estimatedMinutes} min
          </span>
        </div>

        <h1 className="font-display mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          {lesson.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
          {lesson.description}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lesson.objectives.map((objective) => (
            <div
              key={objective}
              className="rounded-3xl border border-stone-200 bg-stone-50 p-5 text-sm font-medium leading-6 text-slate-700"
            >
              {objective}
            </div>
          ))}
        </div>
      </section>

      {canAccess ? (
        <>
          {lesson.learningCards.length > 0 ? (
            <section className="mx-auto mt-8 max-w-6xl">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {lesson.learningCards.map((card) => (
                  <article
                    key={card.id}
                    className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[var(--shadow-card)]"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b1028]">
                      Learn
                    </p>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                      {card.title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-slate-600">
                      {card.body}
                    </p>
                    {card.visual ? (
                      <div className="mt-6 rounded-3xl bg-stone-50 px-4 py-6 text-center text-3xl font-semibold text-slate-900">
                        {card.visual}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mx-auto mt-8 max-w-6xl">
            <LessonPlayer
              lesson={lesson}
              initialProgress={progressMap[lesson.slug] ?? null}
              canSaveProgress={Boolean(memberContext.user)}
              topicHref={topicHref}
              nextLessonHref={nextLessonHref}
              loginHref={loginHref}
              signupHref={signupHref}
            />
          </section>
        </>
      ) : (
        <section className="mx-auto mt-8 max-w-6xl">
          <PremiumLock
            title="Unlock this lesson with ELimuCore membership"
            loginHref={loginHref}
            signupHref={signupHref}
          />
        </section>
      )}
    </main>
  );
}
