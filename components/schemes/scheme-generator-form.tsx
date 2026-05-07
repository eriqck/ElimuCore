"use client";

import { useState } from "react";
import { trackMarketingEvent } from "@/lib/marketing-client";
import {
  getSuggestedSchemeTextbook,
  schemeSubjectSuggestions
} from "@/lib/scheme-catalog";
import type { SchemeLanguage, SchemeStage } from "@/lib/types";

type SchemeGeneratorFormProps = {
  teacherName: string;
  defaultSchoolName?: string;
  hasUnlimitedAccess: boolean;
};

const stageOptions: Array<{
  value: SchemeStage;
  label: string;
  classes: string[];
}> = [
  {
    value: "pre-primary",
    label: "Pre-Primary",
    classes: ["PP1", "PP2"]
  },
  {
    value: "junior-school",
    label: "Junior School",
    classes: [
      "Grade 1",
      "Grade 2",
      "Grade 3",
      "Grade 4",
      "Grade 5",
      "Grade 6",
      "Grade 7",
      "Grade 8",
      "Grade 9"
    ]
  },
  {
    value: "senior-school",
    label: "Senior School",
    classes: ["Grade 10"]
  }
];

function getClassesForStage(stage: SchemeStage) {
  return stageOptions.find((item) => item.value === stage)?.classes ?? [];
}

function inferLanguage(subject: string): SchemeLanguage {
  return /kiswahili/i.test(subject) ? "sw" : "en";
}

export function SchemeGeneratorForm({
  teacherName,
  defaultSchoolName = "",
  hasUnlimitedAccess
}: SchemeGeneratorFormProps) {
  const [stage, setStage] = useState<SchemeStage>("junior-school");
  const [classLabel, setClassLabel] = useState("Grade 7");
  const [subject, setSubject] = useState("Mathematics");
  const [language, setLanguage] = useState<SchemeLanguage>("en");
  const [textbook, setTextbook] = useState("");

  const classOptions = getClassesForStage(stage);
  const suggestedTextbook = getSuggestedSchemeTextbook({
    stage,
    classLabel,
    subject
  });

  return (
    <form
      action="/api/scheme-bot/create"
      method="post"
      onSubmit={() => {
        if (!hasUnlimitedAccess) {
          trackMarketingEvent({
            eventName: "InitiateCheckout",
            dedupeKey: `scheme-checkout:${stage}:${classLabel}:${subject}`,
            payload: {
              value: 20,
              currency: "KES",
              content_name: `${classLabel} ${subject}`,
              content_category: "teacher_documents",
              checkout_type: "single_document",
              level: stage
            }
          });
        }
      }}
      className="grid gap-5 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="stage"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Level
          </label>
          <select
            id="stage"
            name="stage"
            value={stage}
            onChange={(event) => {
              const nextStage = event.target.value as SchemeStage;
              const nextClasses = getClassesForStage(nextStage);
              setStage(nextStage);
              setClassLabel(nextClasses[0] ?? "");
            }}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            {stageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="class_label"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Class
          </label>
          <select
            id="class_label"
            name="class_label"
            value={classLabel}
            onChange={(event) => setClassLabel(event.target.value)}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="subject"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            list="scheme-subjects"
            value={subject}
            onChange={(event) => {
              const nextSubject = event.target.value;
              setSubject(nextSubject);
              setLanguage(inferLanguage(nextSubject));
            }}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            placeholder="Type or choose a subject"
            required
          />
          <datalist id="scheme-subjects">
            {schemeSubjectSuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>
        <div>
          <label
            htmlFor="language"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Output language
          </label>
          <select
            id="language"
            name="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as SchemeLanguage)}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            <option value="en">English</option>
            <option value="sw">Kiswahili</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="term"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Term
          </label>
          <select
            id="term"
            name="term"
            defaultValue="2"
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="year"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            min="2024"
            max="2100"
            defaultValue={new Date().getFullYear()}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="weeks_in_term"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Weeks
          </label>
          <input
            id="weeks_in_term"
            name="weeks_in_term"
            type="number"
            min="1"
            max="20"
            defaultValue="12"
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="lessons_per_week"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Lessons / week
          </label>
          <input
            id="lessons_per_week"
            name="lessons_per_week"
            type="number"
            min="1"
            max="10"
            defaultValue="2"
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            required
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="teacher_name"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Teacher name
          </label>
          <input
            id="teacher_name"
            name="teacher_name"
            defaultValue={teacherName}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            placeholder="Teacher name"
          />
        </div>
        <div>
          <label
            htmlFor="school_name"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            School name
          </label>
          <input
            id="school_name"
            name="school_name"
            defaultValue={defaultSchoolName}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            placeholder="School name"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="textbook"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Main textbook or book reference
          </label>
          <input
            id="textbook"
            name="textbook"
            value={textbook}
            onChange={(event) => setTextbook(event.target.value)}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            placeholder={suggestedTextbook}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Suggested:</span>
            <button
              type="button"
              onClick={() => setTextbook(suggestedTextbook)}
              className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              {suggestedTextbook}
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Extra instructions
          </label>
          <input
            id="notes"
            name="notes"
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            placeholder="Any special focus for this term"
          />
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
        {hasUnlimitedAccess
          ? "Premium access: build and download as many teacher documents as you need."
          : "Single document access: KSh 20 per document."}
      </div>

      <button
        type="submit"
        className="brand-button-primary rounded-2xl px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5"
      >
        {hasUnlimitedAccess ? "Build scheme" : "Continue to KSh 20 checkout"}
      </button>
    </form>
  );
}
