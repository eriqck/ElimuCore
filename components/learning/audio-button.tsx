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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return [];
    }

    return window.speechSynthesis.getVoices();
  });
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";

  useEffect(() => {
    if (!supported) {
      return;
    }

    const syncVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener("voiceschanged", syncVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", syncVoices);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

  function pickPreferredVoice() {
    const femaleHints = [
      "female",
      "woman",
      "girl",
      "samantha",
      "zira",
      "serena",
      "karen",
      "moira",
      "fiona",
      "tessa",
      "veena",
      "google uk english female"
    ];
    const englishVoices = voices.filter((voice) =>
      voice.lang.toLowerCase().startsWith("en")
    );
    const preferredPool = englishVoices.length > 0 ? englishVoices : voices;

    return (
      preferredPool.find((voice) =>
        femaleHints.some((hint) =>
          `${voice.name} ${voice.voiceURI}`.toLowerCase().includes(hint)
        )
      ) ??
      preferredPool.find((voice) =>
        voice.lang.toLowerCase().startsWith("en-ke")
      ) ??
      preferredPool[0] ??
      null
    );
  }

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
    const voice = pickPreferredVoice();
    utterance.lang = voice?.lang ?? "en-KE";
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 0.92;
    utterance.pitch = 1.15;
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
