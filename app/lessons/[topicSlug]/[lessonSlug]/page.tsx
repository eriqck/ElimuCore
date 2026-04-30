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
    <main className="learning-stage min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="learning-panel relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-[#31b8a7]/10 blur-2xl" />
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#8d4db2]/10 blur-3xl" />

        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
          <Link href="/classes" className="transition hover:text-[#8b1028]">
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
                ? "bg-[#e9fbf8] text-[#13806f]"
                : "bg-[#fff0f4] text-[#8b1028]"
            }`}
          >
            {lesson.access === "free" ? "Free lesson" : "Premium lesson"}
          </span>
          <span className="rounded-full bg-[#fff8ea] px-3 py-1 text-xs font-semibold text-[#b37207]">
            {lesson.lessonType}
          </span>
          <span className="rounded-full bg-[#f7f3ff] px-3 py-1 text-xs font-semibold text-[#724795]">
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
          {lesson.objectives.map((objective, index) => (
            <div
              key={objective}
              className={`learning-lift-card rounded-3xl border p-5 text-sm font-medium leading-6 ${
                index % 3 === 0
                  ? "border-[#daf5ef] bg-[#eefbf8] text-[#155c54]"
                  : index % 3 === 1
                    ? "border-[#e6d8f6] bg-[#f7f3ff] text-[#5f3c83]"
                    : "border-[#f6e1b6] bg-[#fff8ea] text-[#8a5e09]"
              }`}
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
                {lesson.learningCards.map((card, index) => (
                  <article
                    key={card.id}
                    className={`learning-lift-card rounded-[2rem] border p-6 shadow-[var(--shadow-card)] ${
                      index % 3 === 0
                        ? "border-[#daf5ef] bg-[linear-gradient(180deg,#eefbf8,#ffffff)]"
                        : index % 3 === 1
                          ? "border-[#e6d8f6] bg-[linear-gradient(180deg,#f7f3ff,#ffffff)]"
                          : "border-[#f6e1b6] bg-[linear-gradient(180deg,#fff8ea,#ffffff)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b1028]">
                        Learn
                      </p>
                    </div>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                      {card.title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-slate-600">
                      {card.body}
                    </p>
                    {card.visual ? (
                      <div className="learning-float mt-6 rounded-3xl bg-white/80 px-4 py-6 text-center text-3xl font-semibold text-slate-900 shadow-sm">
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
