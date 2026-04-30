"use client";

import { useEffect, useState } from "react";

type AudioButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

export function AudioButton({
  text,
  label = "Listen",
  className = ""
}: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function handleSpeak() {
    if (!supported || !text.trim()) {
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-KE";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={!supported}
      data-speaking={speaking}
      className={`learning-audio-button inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      aria-label={label}
      title={label}
    >
      <span className="learning-audio-bars" aria-hidden="true">
        <span className="learning-audio-bar" />
        <span className="learning-audio-bar" />
        <span className="learning-audio-bar" />
      </span>
      <span>{speaking ? "Playing" : label}</span>
    </button>
  );
}
