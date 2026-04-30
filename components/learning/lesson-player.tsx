"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  LearningLesson,
  LearningLessonProgress
} from "@/lib/types";

type LessonPlayerProps = {
  lesson: LearningLesson;
  initialProgress: LearningLessonProgress | null;
  canSaveProgress: boolean;
  topicHref: string;
  nextLessonHref: string | null;
  loginHref: string;
  signupHref: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function LessonPlayer({
  lesson,
  initialProgress,
  canSaveProgress,
  topicHref,
  nextLessonHref,
  loginHref,
  signupHref
}: LessonPlayerProps) {
  const totalQuestions = lesson.questions.length;
  const isQuiz = lesson.lessonType === "quiz";
  const startingAnswers = useMemo(
    () => Array.from({ length: totalQuestions }, () => null as number | null),
    [totalQuestions]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(startingAnswers);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<{
    kind: "correct" | "incorrect";
    text: string;
  } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [finalScore, setFinalScore] = useState<number | null>(
    initialProgress?.score ?? null
  );

  const currentQuestion = lesson.questions[currentIndex];
  const answeredCurrent = answers[currentIndex] !== null;

  async function persistProgress(score: number) {
    if (!canSaveProgress) {
      return;
    }

    try {
      setSaveState("saving");

      const response = await fetch("/api/learning/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          classSlug: lesson.classSlug,
          topicSlug: lesson.topicSlug,
          lessonSlug: lesson.slug,
          lessonType: lesson.lessonType,
          score,
          questionCount: totalQuestions,
          correctCount,
          answers
        })
      });

      if (!response.ok) {
        throw new Error("Unable to save progress");
      }

      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  async function finishLesson() {
    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 100;

    setFinalScore(score);
    setIsFinished(true);
    await persistProgress(score);
  }

  function handleChoice(choiceIndex: number) {
    if (isFinished || !currentQuestion) {
      return;
    }

    if (isQuiz) {
      if (answeredCurrent) {
        return;
      }

      const nextAnswers = [...answers];
      nextAnswers[currentIndex] = choiceIndex;
      setAnswers(nextAnswers);

      const isCorrect = choiceIndex === currentQuestion.correctIndex;
      if (isCorrect) {
        setCorrectCount((value) => value + 1);
      }

      setFeedback({
        kind: isCorrect ? "correct" : "incorrect",
        text: isCorrect
          ? currentQuestion.explanation
          : `${currentQuestion.hint} ${currentQuestion.explanation}`
      });
      return;
    }

    const isCorrect = choiceIndex === currentQuestion.correctIndex;

    if (!isCorrect) {
      setFeedback({
        kind: "incorrect",
        text: currentQuestion.hint
      });
      return;
    }

    if (!answeredCurrent) {
      const nextAnswers = [...answers];
      nextAnswers[currentIndex] = choiceIndex;
      setAnswers(nextAnswers);
      setCorrectCount((value) => value + 1);
    }

    setFeedback({
      kind: "correct",
      text: currentQuestion.explanation
    });
  }

  async function handleContinue() {
    setFeedback(null);

    if (currentIndex === totalQuestions - 1) {
      await finishLesson();
      return;
    }

    setCurrentIndex((value) => value + 1);
  }

  function getScoreMessage(score: number) {
    if (score >= 90) {
      return "Excellent work. Keep moving through the topic.";
    }

    if (score >= lesson.passingScore) {
      return "Strong progress. Review the lesson once more and continue.";
    }

    return "Good effort. Revisit the lesson and try the questions again.";
  }

  if (isFinished) {
    const score = finalScore ?? 0;

    return (
      <section className="rounded-[2rem] border border-emerald-100 bg-emerald-50/70 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Lesson complete
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          Score: {score}%
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
          {getScoreMessage(score)}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {nextLessonHref ? (
            <Link
              href={nextLessonHref}
              className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Continue to next lesson
            </Link>
          ) : (
            <Link
              href={topicHref}
              className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Back to topic
            </Link>
          )}
          <Link
            href={topicHref}
            className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
          >
            Topic overview
          </Link>
        </div>

        <div className="mt-6 text-sm text-slate-600">
          {canSaveProgress ? (
            saveState === "saved" ? (
              <p>Your progress has been saved to your account.</p>
            ) : saveState === "saving" ? (
              <p>Saving your progress...</p>
            ) : saveState === "error" ? (
              <p>Your score is ready. Progress will sync once saving is available.</p>
            ) : null
          ) : (
            <p>
              Sign in to save progress across devices.{" "}
              <Link href={loginHref} className="font-semibold text-[#8b1028]">
                Login
              </Link>{" "}
              or{" "}
              <Link href={signupHref} className="font-semibold text-[#8b1028]">
                create an account
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const progressPercent =
    totalQuestions > 0
      ? Math.round((currentIndex / totalQuestions) * 100)
      : 0;

  return (
    <section className="rounded-[2rem] border border-white/60 surface-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b1028]">
            {isQuiz ? "Topic quiz" : "Interactive practice"}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {lesson.title}
          </h2>
        </div>
        <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-slate-700">
          Question {currentIndex + 1} of {totalQuestions}
        </div>
      </div>

      <div className="mt-5 h-3 rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-[#31b8a7] transition-all"
          style={{ width: `${Math.max(progressPercent, 6)}%` }}
        />
      </div>

      <div className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-lg font-semibold leading-8 text-slate-900 sm:text-2xl">
          {currentQuestion.prompt}
        </p>

        {currentQuestion.visual ? (
          <div className="mt-6 rounded-3xl bg-stone-50 px-5 py-6 text-center text-3xl leading-relaxed text-slate-900 sm:text-4xl">
            {currentQuestion.visual}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {currentQuestion.choices.map((choice, choiceIndex) => {
            const isSelected = answers[currentIndex] === choiceIndex;

            return (
              <button
                key={choice}
                type="button"
                onClick={() => handleChoice(choiceIndex)}
                className={`rounded-2xl border px-4 py-4 text-left text-base font-semibold transition ${
                  isSelected
                    ? "border-[#8b1028] bg-[#8b1028] text-white"
                    : "border-stone-200 bg-white text-slate-800 hover:border-[#31b8a7] hover:bg-[#f3fcfa]"
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {feedback ? (
          <div
            className={`mt-6 rounded-2xl px-4 py-4 text-sm font-medium ${
              feedback.kind === "correct"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {feedback.kind === "correct" ? "Correct. " : "Try again. "}
            {feedback.text}
          </div>
        ) : null}

        {(isQuiz ? answeredCurrent : answers[currentIndex] !== null) ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleContinue}
              className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              {currentIndex === totalQuestions - 1 ? "Finish lesson" : "Next question"}
            </button>
            <Link
              href={topicHref}
              className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
            >
              Leave lesson
            </Link>
          </div>
        ) : null}
      </div>

      {initialProgress?.completed ? (
        <p className="mt-5 text-sm font-medium text-slate-500">
          Completed earlier with a saved score of {initialProgress.score ?? 0}%.
        </p>
      ) : null}
    </section>
  );
}
