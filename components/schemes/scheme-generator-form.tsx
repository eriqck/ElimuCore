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
  range: string;
  classes: string[];
}> = [
  {
    value: "pre-primary",
    label: "Pre-Primary",
    range: "PP1 and PP2",
    classes: ["PP1", "PP2"]
  },
  {
    value: "junior-school",
    label: "Junior School",
    range: "Grade 1 to Grade 9",
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
    range: "Grade 10",
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
      className="scheme-bot-form-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="scheme-bot-chip">New document</span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            Scheme of Work
          </h2>
        </div>
        <div className="scheme-bot-access-pill">
          {hasUnlimitedAccess ? "Premium access" : "KSh 20 per document"}
        </div>
      </div>

      <div className="mt-2 grid gap-3 lg:grid-cols-3">
        {stageOptions.map((option) => {
          const active = stage === option.value;

          return (
            <label
              key={option.value}
              className={`scheme-bot-stage-card ${active ? "scheme-bot-stage-card-active" : ""}`}
            >
              <input
                type="radio"
                name="stage"
                value={option.value}
                checked={active}
                onChange={() => {
                  const nextStage = option.value;
                  const nextClasses = getClassesForStage(nextStage);
                  setStage(nextStage);
                  setClassLabel(nextClasses[0] ?? "");
                }}
                className="sr-only"
              />
              <span className="block text-base font-bold text-slate-950">
                {option.label}
              </span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">
                {option.range}
              </span>
            </label>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="class_label" className="scheme-bot-field-label">
            Class
          </label>
          <select
            id="class_label"
            name="class_label"
            value={classLabel}
            onChange={(event) => setClassLabel(event.target.value)}
            className="scheme-bot-input"
          >
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="scheme-bot-field-label">
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
            className="scheme-bot-input"
            placeholder="Type or choose a subject"
            required
          />
          <datalist id="scheme-subjects">
            {schemeSubjectSuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label htmlFor="term" className="scheme-bot-field-label">
            Term
          </label>
          <select
            id="term"
            name="term"
            defaultValue="2"
            className="scheme-bot-input"
          >
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
        </div>

        <div>
          <label htmlFor="year" className="scheme-bot-field-label">
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            min="2024"
            max="2100"
            defaultValue={new Date().getFullYear()}
            className="scheme-bot-input"
            required
          />
        </div>

        <div>
          <label htmlFor="weeks_in_term" className="scheme-bot-field-label">
            Weeks
          </label>
          <input
            id="weeks_in_term"
            name="weeks_in_term"
            type="number"
            min="1"
            max="20"
            defaultValue="12"
            className="scheme-bot-input"
            required
          />
        </div>

        <div>
          <label htmlFor="lessons_per_week" className="scheme-bot-field-label">
            Lessons / week
          </label>
          <input
            id="lessons_per_week"
            name="lessons_per_week"
            type="number"
            min="1"
            max="10"
            defaultValue="2"
            className="scheme-bot-input"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="teacher_name" className="scheme-bot-field-label">
            Teacher name
          </label>
          <input
            id="teacher_name"
            name="teacher_name"
            defaultValue={teacherName}
            className="scheme-bot-input"
            placeholder="Teacher name"
          />
        </div>

        <div>
          <label htmlFor="school_name" className="scheme-bot-field-label">
            School name
          </label>
          <input
            id="school_name"
            name="school_name"
            defaultValue={defaultSchoolName}
            className="scheme-bot-input"
            placeholder="School name"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="language" className="scheme-bot-field-label">
            Output language
          </label>
          <select
            id="language"
            name="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as SchemeLanguage)}
            className="scheme-bot-input"
          >
            <option value="en">English</option>
            <option value="sw">Kiswahili</option>
          </select>
        </div>

        <div>
          <label htmlFor="textbook" className="scheme-bot-field-label">
            Main textbook or reference
          </label>
          <input
            id="textbook"
            name="textbook"
            value={textbook}
            onChange={(event) => setTextbook(event.target.value)}
            className="scheme-bot-input"
            placeholder={suggestedTextbook}
          />
        </div>
      </div>

      <div className="scheme-bot-suggestion-card">
        <div>
          <p className="text-sm font-bold text-slate-950">Suggested reference</p>
          <p className="mt-1 text-sm text-slate-600">{suggestedTextbook}</p>
        </div>
        <button
          type="button"
          onClick={() => setTextbook(suggestedTextbook)}
          className="scheme-bot-inline-button"
        >
          Use this
        </button>
      </div>

      <div>
        <label htmlFor="notes" className="scheme-bot-field-label">
          Extra instructions
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="scheme-bot-textarea"
          placeholder="Add any special term focus, school preference, or topic priority."
        />
      </div>

      <div className="scheme-bot-form-footer">
        <div className="scheme-bot-form-note">
          {hasUnlimitedAccess
            ? "Unlimited access"
            : "KSh 20 one-time access"}
        </div>
        <button type="submit" className="scheme-bot-button-primary">
          {hasUnlimitedAccess ? "Build scheme of work" : "Continue to checkout"}
        </button>
      </div>
    </form>
  );
}
