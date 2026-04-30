import { NextRequest, NextResponse } from "next/server";
import {
  canAccessLearningItem,
  getLearningLessonBySlugs
} from "@/lib/learning";
import { getCurrentMemberContext } from "@/lib/membership";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type ProgressPayload = {
  classSlug?: string;
  topicSlug?: string;
  lessonSlug?: string;
  lessonType?: string;
  score?: number;
  questionCount?: number;
  correctCount?: number;
  answers?: Array<number | null>;
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Progress saving is not configured." },
      { status: 503 }
    );
  }

  const payload = (await request.json()) as ProgressPayload;

  if (!payload.topicSlug || !payload.lessonSlug) {
    return NextResponse.json(
      { error: "Lesson information is required." },
      { status: 400 }
    );
  }

  const lessonResult = await getLearningLessonBySlugs(
    payload.topicSlug,
    payload.lessonSlug
  );

  if (!lessonResult) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  const memberContext = await getCurrentMemberContext();

  if (!memberContext.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { lesson } = lessonResult;
  const canAccess = canAccessLearningItem(
    lesson.access,
    Boolean(memberContext.activeMembership)
  );

  if (!canAccess) {
    return NextResponse.json(
      { error: "Membership required." },
      { status: 403 }
    );
  }

  const score = clampScore(Number(payload.score ?? 0));
  const questionCount = Math.max(0, Math.round(Number(payload.questionCount ?? 0)));
  const correctCount = Math.max(0, Math.round(Number(payload.correctCount ?? 0)));
  const answers = Array.isArray(payload.answers) ? payload.answers : [];

  try {
    const supabase = await createClient();
    const timestamp = new Date().toISOString();
    const { error: progressError } = await supabase
      .from("learning_progress")
      .upsert(
        {
          user_id: memberContext.user.id,
          class_slug: lesson.classSlug,
          topic_slug: lesson.topicSlug,
          lesson_slug: lesson.slug,
          completed: true,
          score,
          question_count: questionCount,
          completed_at: timestamp,
          last_activity_at: timestamp
        },
        {
          onConflict: "user_id,lesson_slug"
        }
      );

    if (progressError) {
      return NextResponse.json(
        { error: "Unable to save progress right now." },
        { status: 500 }
      );
    }

    if (lesson.lessonType === "quiz") {
      const { error: attemptError } = await supabase
        .from("learning_quiz_attempts")
        .insert({
          user_id: memberContext.user.id,
          class_slug: lesson.classSlug,
          topic_slug: lesson.topicSlug,
          lesson_slug: lesson.slug,
          score,
          question_count: questionCount,
          correct_count: correctCount,
          answers
        });

      if (attemptError) {
        return NextResponse.json(
          { error: "Quiz score saved, but attempt history failed." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to save progress right now." },
      { status: 500 }
    );
  }
}
