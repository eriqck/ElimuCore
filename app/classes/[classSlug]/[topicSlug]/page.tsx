import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  canAccessLearningItem,
  getLearningProgressForCurrentUser,
  getLearningTopicBySlugs,
  getLearningTopicProgressSummary
} from "@/lib/learning";
import { getCurrentMemberContext, hasPremiumAccess } from "@/lib/membership";

type TopicPageProps = {
  params: Promise<{
    classSlug: string;
    topicSlug: string;
  }>;
};

type IconProps = {
  name:
    | "arrow"
    | "check"
    | "lock"
    | "play"
    | "sparkles"
    | "star"
    | "trophy";
  className?: string;
  size?: number;
};

function Icon({ name, className = "", size = 20 }: IconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className
  };

  switch (name) {
    case "arrow":
      return (
        <svg {...commonProps}>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      );
    case "check":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );
    case "lock":
      return (
        <svg {...commonProps}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "play":
      return (
        <svg {...commonProps} fill="currentColor" stroke="none">
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...commonProps}>
          <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
          <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
          <path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z" />
        </svg>
      );
    case "star":
      return (
        <svg {...commonProps} fill="currentColor" stroke="currentColor">
          <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21 7 14.2 2 9.3l6.9-1L12 2z" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...commonProps}>
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
          <path d="M5 5H3v3a4 4 0 0 0 4 4" />
          <path d="M19 5h2v3a4 4 0 0 1-4 4" />
        </svg>
      );
    default:
      return null;
  }
}

function Bubble({ className = "" }: { className?: string }) {
  return <div className={`absolute rounded-full blur-sm ${className}`} />;
}

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
  const hasPremium = hasPremiumAccess(memberContext);
  const summary = getLearningTopicProgressSummary(topic, progressMap);
  const freeLessons = topic.lessons.filter((lesson) => lesson.access === "free");
  const firstLesson = freeLessons[0] ?? topic.lessons[0] ?? null;

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-950">
      <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-5 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-14">
        <Bubble className="left-8 top-20 h-28 w-28 bg-emerald-300/60" />
        <Bubble className="right-20 top-40 h-32 w-32 bg-fuchsia-300/70" />
        <Bubble className="bottom-10 left-1/2 h-28 w-28 bg-sky-300/50" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-700 shadow-sm">
              <Icon name="sparkles" size={16} /> Topic path
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">
              Learn step by step.
              <span className="block text-emerald-600">{topic.title}</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              {topic.summary} This topic gives children a simple lesson path
              with guided practice, quick checks, and support for parents and
              teachers along the way.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={
                  firstLesson
                    ? `/lessons/${topic.slug}/${firstLesson.slug}`
                    : `/classes/${learningClass.slug}`
                }
                className="group rounded-full bg-emerald-500 px-7 py-4 text-center text-base font-black text-white shadow-2xl shadow-emerald-200 transition hover:-translate-y-1 hover:bg-emerald-600"
              >
                Start learning
                <Icon
                  name="play"
                  className="ml-2 inline transition group-hover:translate-x-1"
                  size={17}
                />
              </Link>
              <Link
                href={`/classes/${learningClass.slug}`}
                className="rounded-full border border-slate-200 bg-white px-7 py-4 text-center text-base font-black text-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                Back to class
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                [`${topic.lessons.length}`, "Lessons"],
                [`${summary.percent}%`, "Progress"],
                [hasPremium ? "On" : "Off", "Full access"]
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur"
                >
                  <p className="text-3xl font-black text-slate-950">{value}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-5 shadow-2xl shadow-emerald-100">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/40 blur-3xl" />
              <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl" />

              <div className="relative rounded-[2.4rem] bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 p-6 text-white">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.28em] text-white/70">
                      In this topic
                    </p>
                    <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">
                      {learningClass.title}
                    </h2>
                  </div>
                  <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/20 backdrop-blur">
                    <Icon name="trophy" size={30} />
                  </div>
                </div>

                <div className="mt-8 grid gap-3">
                  {[
                    "Tiny lesson steps",
                    "Immediate answer checks",
                    "Free lesson preview",
                    "Member progress saving"
                  ].map((feature, index) => (
                    <div
                      key={feature}
                      className="flex items-center justify-between rounded-3xl bg-white/[0.16] p-4 ring-1 ring-white/20 backdrop-blur"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-emerald-600">
                          <Icon name="check" size={18} />
                        </span>
                        <span className="font-black">{feature}</span>
                      </div>
                      <span className="text-sm font-black text-white/70">
                        0{index + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[2rem] bg-white p-5 text-slate-950 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        Topic access
                      </p>
                      <p className="mt-1 text-2xl font-black">
                        {hasPremium ? "Unlocked" : "Preview"}
                      </p>
                    </div>
                    <div className="flex gap-1 text-amber-400">
                      {[1, 2, 3].map((i) => (
                        <Icon key={i} name="star" size={22} />
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-emerald-500"
                      style={{ width: `${Math.max(summary.percent, 18)}%` }}
                    />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-600">
                    {freeLessons.length} free lesson
                    {freeLessons.length === 1 ? "" : "s"} ready to start in
                    this topic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.32em] text-emerald-600">
                Lessons
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">
                Open a lesson.
              </h2>
            </div>
            <span className="w-fit rounded-full bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm ring-1 ring-slate-200">
              {topic.title}
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {topic.lessons.map((lesson, index) => {
              const lessonProgress = progressMap[lesson.slug] ?? null;
              const canAccess = canAccessLearningItem(lesson.access, hasPremium);
              const accent = [
                "from-emerald-500 to-lime-400",
                "from-sky-400 to-cyan-400",
                "from-amber-400 to-orange-400",
                "from-fuchsia-500 to-pink-400"
              ][index % 4];

              const content = (
                <>
                  <div
                    className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl transition group-hover:opacity-40`}
                  />

                  <div className="relative">
                    <div className="mb-8 flex items-center justify-between">
                      <span
                        className={`rounded-full bg-gradient-to-r ${accent} px-3 py-1 text-xs font-black uppercase tracking-wider text-white`}
                      >
                        {lesson.access === "free" ? "Free" : "Premium"}
                      </span>
                      {canAccess ? (
                        <Icon
                          name="play"
                          size={19}
                          className="text-emerald-600"
                        />
                      ) : (
                        <Icon
                          name="lock"
                          size={18}
                          className="text-slate-300"
                        />
                      )}
                    </div>

                    <h3 className="text-2xl font-black tracking-[-0.03em] text-slate-950">
                      {lesson.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {lesson.summary}
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-2xl font-black">
                          {lesson.estimatedMinutes}
                        </p>
                        <p className="text-sm font-semibold text-slate-500">
                          Minutes
                        </p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-2xl font-black">
                          {lessonProgress?.completed ? "Done" : "Ready"}
                        </p>
                        <p className="text-sm font-semibold text-slate-500">
                          Status
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm font-semibold text-slate-500">
                      {lesson.lessonType === "quiz"
                        ? "Quiz lesson"
                        : "Interactive lesson"}
                    </p>

                    <div
                      className={`mt-6 w-full rounded-full px-5 py-4 text-center text-sm font-black transition ${
                        canAccess
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {lessonProgress?.completed ? "Open again" : "Start lesson"}
                    </div>
                  </div>
                </>
              );

              const commonClassName = `group relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 ${
                index === 0 ? "ring-2 ring-emerald-200" : ""
              }`;

              return (
                <Link
                  key={lesson.slug}
                  href={`/lessons/${topic.slug}/${lesson.slug}`}
                  className={commonClassName}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
