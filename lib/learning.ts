import { cache } from "react";
import { fallbackLearningClasses } from "@/lib/learning-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  LearningAccess,
  LearningCard,
  LearningClass,
  LearningLesson,
  LearningLessonProgress,
  LearningQuestion,
  LearningTopic,
  LearningTopicProgressSummary
} from "@/lib/types";

type LearningClassRow = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  audience: string | null;
  status_label: string | null;
  available: boolean | null;
  sort_order: number | null;
  published: boolean | null;
};

type LearningTopicRow = {
  slug: string;
  class_slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  access: LearningAccess | null;
  sort_order: number | null;
  published: boolean | null;
};

type LearningLessonRow = {
  slug: string;
  topic_slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  lesson_type: LearningLesson["lessonType"] | null;
  access: LearningAccess | null;
  estimated_minutes: number | null;
  sort_order: number | null;
  objectives: unknown;
  learning_cards: unknown;
  questions: unknown;
  passing_score: number | null;
  published: boolean | null;
};

type LearningProgressRow = {
  lesson_slug: string;
  class_slug: string;
  topic_slug: string;
  completed: boolean | null;
  score: number | null;
  question_count: number | null;
  completed_at: string | null;
  last_activity_at: string | null;
};

function cleanText(value: string | null | undefined, fallback: string) {
  const normalized = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || fallback;
}

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean);
}

function parseCards(value: unknown): LearningCard[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<LearningCard[]>((acc, entry, index) => {
    if (!entry || typeof entry !== "object") {
      return acc;
    }

    const item = entry as Record<string, unknown>;
    const visual = cleanText(String(item.visual ?? ""), "");

    acc.push({
      id: cleanText(String(item.id ?? index + 1), `card-${index + 1}`),
      title: cleanText(String(item.title ?? ""), `Card ${index + 1}`),
      body: cleanText(String(item.body ?? ""), "Keep learning."),
      ...(visual ? { visual } : {})
    });

    return acc;
  }, []);
}

function parseQuestions(value: unknown): LearningQuestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<LearningQuestion[]>((acc, entry, index) => {
    if (!entry || typeof entry !== "object") {
      return acc;
    }

    const item = entry as Record<string, unknown>;
    const choices = Array.isArray(item.choices)
      ? item.choices.map((choice) => String(choice ?? "").trim()).filter(Boolean)
      : [];
    const correctIndex = Number(item.correctIndex ?? -1);

    if (choices.length === 0 || !Number.isInteger(correctIndex)) {
      return acc;
    }

    const visual = cleanText(String(item.visual ?? ""), "");

    acc.push({
      id: cleanText(String(item.id ?? index + 1), `question-${index + 1}`),
      prompt: cleanText(String(item.prompt ?? ""), "Choose the correct answer."),
      ...(visual ? { visual } : {}),
      choices,
      correctIndex,
      hint: cleanText(String(item.hint ?? ""), "Try one more time."),
      explanation: cleanText(
        String(item.explanation ?? ""),
        "That is the correct answer."
      )
    });

    return acc;
  }, []);
}

function normalizeLesson(
  row: LearningLessonRow,
  topic: LearningTopicRow
): LearningLesson | null {
  const questions = parseQuestions(row.questions);
  const lessonType = row.lesson_type ?? "practice";

  if (!["guided", "practice", "quiz"].includes(lessonType)) {
    return null;
  }

  return {
    slug: row.slug,
    topicSlug: topic.slug,
    classSlug: topic.class_slug,
    title: cleanText(row.title, "Untitled lesson"),
    summary: cleanText(row.summary, "A guided ELimuCore lesson."),
    description: cleanText(row.description, "A guided ELimuCore lesson."),
    lessonType,
    access: row.access === "premium" ? "premium" : "free",
    estimatedMinutes: row.estimated_minutes ?? 8,
    sortOrder: row.sort_order ?? 0,
    objectives: parseStringArray(row.objectives),
    learningCards: parseCards(row.learning_cards),
    questions,
    passingScore: row.passing_score ?? (lessonType === "quiz" ? 70 : 100)
  };
}

function buildFallbackCatalog(): LearningClass[] {
  return fallbackLearningClasses.map((item) => ({
    ...item,
    topics: item.topics.map((topic) => ({
      ...topic,
      lessons: [...topic.lessons].sort((a, b) => a.sortOrder - b.sortOrder)
    }))
  })).sort((a, b) => a.sortOrder - b.sortOrder);
}

async function getSupabaseLearningCatalog(): Promise<LearningClass[]> {
  if (!hasSupabaseEnv()) {
    return buildFallbackCatalog();
  }

  try {
    const supabase = await createClient();
    const [classResponse, topicResponse, lessonResponse] = await Promise.all([
      supabase
        .from("learning_classes")
        .select(
          "slug, title, subtitle, description, audience, status_label, available, sort_order, published"
        )
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("learning_topics")
        .select(
          "slug, class_slug, title, summary, description, access, sort_order, published"
        )
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("learning_lessons")
        .select(
          "slug, topic_slug, title, summary, description, lesson_type, access, estimated_minutes, sort_order, objectives, learning_cards, questions, passing_score, published"
        )
        .eq("published", true)
        .order("sort_order", { ascending: true })
    ]);

    if (
      classResponse.error ||
      topicResponse.error ||
      lessonResponse.error ||
      !classResponse.data ||
      !topicResponse.data ||
      !lessonResponse.data
    ) {
      return buildFallbackCatalog();
    }

    const classes = classResponse.data as LearningClassRow[];
    const topics = topicResponse.data as LearningTopicRow[];
    const lessons = lessonResponse.data as LearningLessonRow[];

    if (classes.length === 0 || topics.length === 0 || lessons.length === 0) {
      return buildFallbackCatalog();
    }

    return classes
      .filter((item) => item.published !== false)
      .map((item) => {
        const classTopics: LearningTopic[] = topics
          .filter(
            (topic) => topic.class_slug === item.slug && topic.published !== false
          )
          .map((topic) => ({
            slug: topic.slug,
            classSlug: item.slug,
            title: cleanText(topic.title, "Untitled topic"),
            summary: cleanText(topic.summary, "A structured ELimuCore topic."),
            description: cleanText(
              topic.description,
              "A structured ELimuCore topic."
            ),
            access:
              topic.access === "premium"
                ? ("premium" as const)
                : ("free" as const),
            sortOrder: topic.sort_order ?? 0,
            lessons: lessons
              .filter(
                (lesson) =>
                  lesson.topic_slug === topic.slug && lesson.published !== false
              )
              .map((lesson) => normalizeLesson(lesson, topic))
              .filter((lesson): lesson is LearningLesson => Boolean(lesson))
              .sort((a, b) => a.sortOrder - b.sortOrder)
          }) satisfies LearningTopic)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        return {
          slug: item.slug,
          title: cleanText(item.title, "Untitled class"),
          subtitle: cleanText(item.subtitle, "A structured ELimuCore class."),
          description: cleanText(
            item.description,
            "A structured ELimuCore class."
          ),
          audience: cleanText(
            item.audience,
            "Built for learners, teachers, and families."
          ),
          statusLabel: cleanText(item.status_label, "Available"),
          available: item.available ?? true,
          sortOrder: item.sort_order ?? 0,
          topics: classTopics
        } satisfies LearningClass;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return buildFallbackCatalog();
  }
}

export const getLearningClasses = cache(async () => {
  return getSupabaseLearningCatalog();
});

export const getLearningClassBySlug = cache(async (slug: string) => {
  const classes = await getLearningClasses();
  return classes.find((item) => item.slug === slug) ?? null;
});

export const getLearningTopicBySlugs = cache(
  async (classSlug: string, topicSlug: string) => {
    const learningClass = await getLearningClassBySlug(classSlug);
    if (!learningClass) {
      return null;
    }

    const topic =
      learningClass.topics.find((item) => item.slug === topicSlug) ?? null;

    return topic ? { learningClass, topic } : null;
  }
);

export const getLearningLessonBySlugs = cache(
  async (topicSlug: string, lessonSlug: string) => {
    const classes = await getLearningClasses();

    for (const learningClass of classes) {
      const topic = learningClass.topics.find((item) => item.slug === topicSlug);

      if (!topic) {
        continue;
      }

      const lesson = topic.lessons.find((item) => item.slug === lessonSlug);

      if (lesson) {
        return { learningClass, topic, lesson };
      }
    }

    return null;
  }
);

export async function getLearningProgressForCurrentUser() {
  if (!hasSupabaseEnv()) {
    return {} as Record<string, LearningLessonProgress>;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return {} as Record<string, LearningLessonProgress>;
    }

    const { data, error } = await supabase
      .from("learning_progress")
      .select(
        "lesson_slug, class_slug, topic_slug, completed, score, question_count, completed_at, last_activity_at"
      )
      .eq("user_id", user.id);

    if (error || !data) {
      return {} as Record<string, LearningLessonProgress>;
    }

    return (data as LearningProgressRow[]).reduce(
      (acc, row) => {
        acc[row.lesson_slug] = {
          lessonSlug: row.lesson_slug,
          classSlug: row.class_slug,
          topicSlug: row.topic_slug,
          completed: row.completed ?? false,
          score: row.score,
          questionCount: row.question_count ?? 0,
          completedAt: row.completed_at,
          lastActivityAt: row.last_activity_at
        };

        return acc;
      },
      {} as Record<string, LearningLessonProgress>
    );
  } catch {
    return {} as Record<string, LearningLessonProgress>;
  }
}

export function getLearningTopicProgressSummary(
  topic: LearningTopic,
  progressMap: Record<string, LearningLessonProgress>
): LearningTopicProgressSummary {
  const totalLessons = topic.lessons.length;
  const completedLessons = topic.lessons.filter(
    (lesson) => progressMap[lesson.slug]?.completed
  ).length;

  return {
    completedLessons,
    totalLessons,
    percent:
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  };
}

export function canAccessLearningItem(
  access: LearningAccess,
  hasActiveMembership: boolean
) {
  return access === "free" || hasActiveMembership;
}
