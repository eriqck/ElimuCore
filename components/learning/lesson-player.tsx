"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AudioButton } from "@/components/learning/audio-button";
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
  const [successMoment, setSuccessMoment] = useState(0);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = lesson.questions[currentIndex];
  const answeredCurrent = answers[currentIndex] !== null;

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  function playSuccessChime() {
    if (
      typeof window === "undefined" ||
      !("AudioContext" in window || "webkitAudioContext" in window)
    ) {
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const now = context.currentTime;
    const notes = [660, 880, 1046];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02 + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.2 + index * 0.08
      );
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + index * 0.08);
      oscillator.stop(now + 0.24 + index * 0.08);
    });

    window.setTimeout(() => {
      void context.close();
    }, 600);
  }

  function triggerSuccessMoment() {
    setSuccessMoment((value) => value + 1);
    playSuccessChime();

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }

    successTimerRef.current = setTimeout(() => {
      setSuccessMoment(0);
    }, 1400);
  }

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
        triggerSuccessMoment();
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
      triggerSuccessMoment();
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
      <section className="rounded-[2rem] border border-[#daf5ef] bg-[linear-gradient(180deg,#eefbf8,#ffffff)] p-6 shadow-[var(--shadow-card)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#13806f]">
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
              className="rounded-2xl bg-[#31b8a7] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(49,184,167,0.24)] transition hover:-translate-y-0.5 hover:bg-[#249888]"
            >
              Continue to next lesson
            </Link>
          ) : (
            <Link
              href={topicHref}
              className="rounded-2xl bg-[#31b8a7] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(49,184,167,0.24)] transition hover:-translate-y-0.5 hover:bg-[#249888]"
            >
              Back to topic
            </Link>
          )}
          <Link
            href={topicHref}
            className="rounded-2xl border border-[#8b1028]/15 bg-white px-5 py-3 text-sm font-semibold text-[#8b1028] transition hover:bg-[#8b1028] hover:text-white"
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
  const spokenQuestion = currentQuestion.prompt;

  return (
    <section className="learning-panel rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b1028]">
            {isQuiz ? "Topic quiz" : "Interactive practice"}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {lesson.title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-[#fff8ea] px-4 py-2 text-sm font-semibold text-[#8a5e09]">
            Question {currentIndex + 1} of {totalQuestions}
          </div>
          <AudioButton text={spokenQuestion} label="Read question" />
        </div>
      </div>

      <div className="mt-5 h-3 rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#31b8a7,#8d4db2,#f3a61a)] transition-all"
          style={{ width: `${Math.max(progressPercent, 6)}%` }}
        />
      </div>

      <div className="relative mt-8 rounded-[2rem] border border-[#eddce2] bg-white p-6 shadow-sm">
        {successMoment > 0 ? (
          <div
            key={successMoment}
            className="learning-success-badge"
            aria-hidden="true"
          >
            <span className="learning-success-glow" />
            <span className="learning-success-check">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <path
                  d="m5 12 4.2 4.2L19 6.5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        ) : null}
        <p className="text-lg font-semibold leading-8 text-slate-900 sm:text-2xl">
          {currentQuestion.prompt}
        </p>

        {currentQuestion.visual ? (
          <div className="learning-float mt-6 rounded-3xl bg-[linear-gradient(135deg,#fff8ea,#ffffff)] px-5 py-6 text-center text-3xl leading-relaxed text-slate-900 shadow-sm sm:text-4xl">
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
                className={`learning-answer-choice rounded-2xl border px-4 py-4 text-left text-base font-semibold ${
                  isSelected
                    ? "border-[#8b1028] bg-[#8b1028] text-white shadow-[0_18px_35px_rgba(139,16,40,0.22)]"
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
                ? "border border-[#ccefe8] bg-[#eefbf8] text-[#126d61]"
                : "border border-[#f6e1b6] bg-[#fff8ea] text-[#8a5e09]"
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
              className="rounded-2xl bg-[#f3a61a] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(243,166,26,0.28)] transition hover:-translate-y-0.5 hover:bg-[#de9516]"
            >
              {currentIndex === totalQuestions - 1 ? "Finish lesson" : "Next question"}
            </button>
            <Link
              href={topicHref}
              className="rounded-2xl border border-[#8b1028]/15 bg-white px-5 py-3 text-sm font-semibold text-[#8b1028] transition hover:bg-[#8b1028] hover:text-white"
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
