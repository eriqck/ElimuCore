import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTeacherDocumentKindLabel } from "@/lib/teacher-documents";
import {
  getSchemeRequestById,
  getSchemeRequestForUser,
  getTeacherDocumentPreviewTitle,
  getTeacherDocumentRowCount,
  hasUnlimitedSchemeAccess
} from "@/lib/scheme-bot";
import { getCurrentMemberContext, hasAdminAccess } from "@/lib/membership";
import type {
  AssessmentDocumentContent,
  LessonNotesDocumentContent,
  LessonPlanDocumentContent,
  MarkingSchemeDocumentContent,
  SchemeDocumentContent,
  SchemeRequest
} from "@/lib/types";

type SchemeRequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    notice?: string;
  }>;
};

const followUpKinds = [
  {
    outputKind: "lesson-plan",
    premiumLabel: "Create lesson plan",
    paidLabel: "Create lesson plan - KSh 20"
  }
] as const;

function formatStageLabel(stage: string) {
  if (stage === "pre-primary") {
    return "Pre-Primary";
  }

  if (stage === "senior-school") {
    return "Senior School";
  }

  return "Junior School";
}

function isSchemePreview(
  content: SchemeRequest["generatedContent"]
): content is SchemeDocumentContent {
  return Boolean(content && "rows" in content);
}

function isLessonPlanPreview(
  content: SchemeRequest["generatedContent"]
): content is LessonPlanDocumentContent {
  return Boolean(content && "lessons" in content);
}

function isAssessmentPreview(
  content: SchemeRequest["generatedContent"]
): content is AssessmentDocumentContent {
  return Boolean(
    content &&
      "sections" in content &&
      Array.isArray(content.sections) &&
      content.sections.some(
        (section) =>
          typeof section === "object" &&
          section !== null &&
          "instructions" in section &&
          "items" in section
      )
  );
}

function isMarkingSchemePreview(
  content: SchemeRequest["generatedContent"]
): content is MarkingSchemeDocumentContent {
  return Boolean(
    content &&
      "sections" in content &&
      Array.isArray(content.sections) &&
      content.sections.some(
        (section) =>
          typeof section === "object" &&
          section !== null &&
          "guidance" in section
      )
  );
}

function isLessonNotesPreview(
  content: SchemeRequest["generatedContent"]
): content is LessonNotesDocumentContent {
  return Boolean(
    content &&
      "sections" in content &&
      Array.isArray(content.sections) &&
      content.sections.some(
        (section) =>
          typeof section === "object" &&
          section !== null &&
          "sectionLabel" in section
      )
  );
}

function getDocumentCountHeading(request: SchemeRequest) {
  if (request.outputKind === "assessment") {
    return "Questions";
  }

  if (request.outputKind === "lesson-plan") {
    return "Lessons";
  }

  if (request.outputKind === "marking-scheme") {
    return "Answers";
  }

  if (request.outputKind === "lesson-notes") {
    return "Notes";
  }

  return "Weeks";
}

function getPendingHeading(request: SchemeRequest) {
  return `Preparing your ${getTeacherDocumentKindLabel(request.outputKind).toLowerCase()}`;
}

function getFailedHeading(request: SchemeRequest) {
  return `This ${getTeacherDocumentKindLabel(request.outputKind).toLowerCase()} needs another try`;
}

function renderSchemePreview(content: SchemeDocumentContent) {
  const headings =
    content.language === "sw"
      ? [
          "Wiki",
          "Kipindi",
          "Mada Kuu",
          "Mada Ndogo",
          "Matokeo Mahususi",
          "Shughuli Za Ujifunzaji",
          "Maswali Dadisi",
          "Nyenzo",
          "Tathmini"
        ]
      : [
          "Week",
          "Lesson",
          "Strand",
          "Sub-Strand",
          "Learning Outcomes",
          "Learning Experiences",
          "KIQ",
          "Resources",
          "Assessment"
        ];

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="scheme-bot-preview-table min-w-full">
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.rows.slice(0, 6).map((row, index) => (
            <tr key={`${row.weekLabel}-${row.lessonLabel}-${index}`}>
              <td>{row.weekLabel}</td>
              <td>{row.lessonLabel}</td>
              <td>{row.strand}</td>
              <td>{row.subStrand}</td>
              <td>{row.outcomes.join(" ")}</td>
              <td>{row.experiences.join(" ")}</td>
              <td>{row.keyInquiryQuestions.join(" ")}</td>
              <td>{row.resources.join(" ")}</td>
              <td>{row.assessment.join(" ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderLessonPlanPreview(content: LessonPlanDocumentContent) {
  return (
    <div className="mt-6 grid gap-4">
      {content.lessons.slice(0, 6).map((lesson) => (
        <article key={lesson.lessonLabel} className="scheme-bot-preview-block">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-950">
              {lesson.lessonLabel}
            </h3>
            <span className="scheme-bot-detail-pill">{lesson.duration}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-[#5a51f5]">
            {lesson.focus}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="scheme-bot-field-mini-label">Objectives</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {lesson.objectives.join(" ")}
              </p>
            </div>
            <div>
              <p className="scheme-bot-field-mini-label">Introduction</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {lesson.introduction.join(" ")}
              </p>
            </div>
            <div>
              <p className="scheme-bot-field-mini-label">Activities</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {lesson.activities.join(" ")}
              </p>
            </div>
            <div>
              <p className="scheme-bot-field-mini-label">Assessment</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {lesson.assessment.join(" ")}
              </p>
            </div>
            <div>
              <p className="scheme-bot-field-mini-label">Homework</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {lesson.homework.join(" ")}
              </p>
            </div>
            <div>
              <p className="scheme-bot-field-mini-label">Differentiation</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {lesson.differentiation.join(" ")}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function renderAssessmentPreview(content: AssessmentDocumentContent) {
  return (
    <div className="mt-6 space-y-5">
      <div className="scheme-bot-highlight-card">
        <p className="text-sm font-semibold text-[#271f76]">
          {`Duration: ${content.durationMinutes} minutes - Total marks: ${content.totalMarks}`}
        </p>
        <div className="mt-3 space-y-2">
          {content.instructions.map((instruction) => (
            <p key={instruction} className="text-sm text-slate-700">
              - {instruction}
            </p>
          ))}
        </div>
      </div>

      {content.sections.map((section) => (
        <section key={section.title} className="scheme-bot-preview-block">
          <h3 className="text-lg font-bold text-slate-950">{section.title}</h3>
          <p className="mt-2 text-sm italic leading-7 text-slate-600">
            {section.instructions}
          </p>
          <div className="mt-4 space-y-4">
            {section.items.slice(0, 4).map((item) => (
              <article
                key={`${section.title}-${item.numberLabel}`}
                className="scheme-bot-sub-block"
              >
                <p className="text-sm font-bold text-slate-950">
                  {`${item.numberLabel} ${item.prompt}`}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {`Teacher guide: ${item.expectedAnswer}`}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5a51f5]">
                  {`${item.marks} marks`}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function renderMarkingSchemePreview(content: MarkingSchemeDocumentContent) {
  return (
    <div className="mt-6 space-y-5">
      <div className="scheme-bot-highlight-card">
        <p className="text-sm font-semibold text-[#271f76]">
          {`Total marks: ${content.totalMarks}`}
        </p>
      </div>

      {content.sections.map((section) => (
        <section key={section.title} className="scheme-bot-preview-block">
          <h3 className="text-lg font-bold text-slate-950">{section.title}</h3>
          <p className="mt-2 text-sm italic leading-7 text-slate-600">
            {section.guidance}
          </p>
          <div className="mt-4 space-y-4">
            {section.items.slice(0, 4).map((item) => (
              <article
                key={`${section.title}-${item.questionLabel}`}
                className="scheme-bot-sub-block"
              >
                <p className="text-sm font-bold text-slate-950">
                  {`${item.questionLabel} ${item.prompt}`}
                </p>
                <div className="mt-2 space-y-2">
                  {item.answerPoints.slice(0, 3).map((point) => (
                    <p key={point} className="text-sm text-slate-600">
                      - {point}
                    </p>
                  ))}
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5a51f5]">
                  {`${item.marks} marks`}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function renderLessonNotesPreview(content: LessonNotesDocumentContent) {
  return (
    <div className="mt-6 grid gap-4">
      {content.sections.slice(0, 5).map((section) => (
        <article key={section.sectionLabel} className="scheme-bot-preview-block">
          <h3 className="text-lg font-bold text-slate-950">
            {section.sectionLabel}
          </h3>
          <p className="mt-2 text-sm font-semibold text-[#5a51f5]">
            {section.focus}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="scheme-bot-field-mini-label">Objectives</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {section.objectives.join(" ")}
              </p>
            </div>
            <div>
              <p className="scheme-bot-field-mini-label">Notes</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {section.explanation.join(" ")}
              </p>
            </div>
            <div>
              <p className="scheme-bot-field-mini-label">Examples</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {section.examples.join(" ")}
              </p>
            </div>
            <div>
              <p className="scheme-bot-field-mini-label">Learner tasks</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {section.learnerTasks.join(" ")}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="scheme-bot-field-mini-label">Home support</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {section.homeSupport.join(" ")}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default async function SchemeRequestDetailPage({
  params,
  searchParams
}: SchemeRequestDetailPageProps) {
  const { id } = await params;
  const memberContext = await getCurrentMemberContext();
  const paramsValue = (await searchParams) ?? {};
  const notice =
    typeof paramsValue.notice === "string"
      ? decodeURIComponent(paramsValue.notice)
      : "";

  if (!memberContext.user) {
    redirect(`/login?next=${encodeURIComponent(`/scheme-bot/${id}`)}`);
  }

  const request = hasAdminAccess(memberContext.profile)
    ? await getSchemeRequestById(id)
    : await getSchemeRequestForUser(id, memberContext.user.id);

  if (!request) {
    notFound();
  }

  const documentLabel = getTeacherDocumentKindLabel(request.outputKind);
  const canCreateFollowUps =
    request.outputKind === "scheme" && request.status === "completed";
  const hasUnlimitedAccess = hasUnlimitedSchemeAccess(memberContext);

  return (
    <main className="scheme-bot-stage min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="scheme-bot-surface-card p-7 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="scheme-bot-tag scheme-bot-tag-primary">
                {documentLabel}
              </span>
              <span className="scheme-bot-tag scheme-bot-tag-soft">
                {formatStageLabel(request.stage)}
              </span>
              <span className="scheme-bot-tag scheme-bot-tag-neutral">
                {request.status.replaceAll("_", " ")}
              </span>
              <span className="scheme-bot-tag scheme-bot-tag-neutral">
                {request.accessMode === "premium"
                  ? "Premium access"
                  : "Single purchase"}
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {getTeacherDocumentPreviewTitle(request)}
            </h1>
            <p className="mt-4 text-sm font-semibold text-slate-500">
              {`Term ${request.term} - ${request.year}`}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">
              {request.generatedOverview || "Open your document."}
            </p>

            {notice ? (
              <div className="mt-6 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-900">
                {notice}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              {request.status === "completed" ? (
                <Link
                  href={`/api/scheme-requests/${request.id}/download`}
                  className="scheme-bot-button-primary"
                >
                  Download DOCX
                </Link>
              ) : null}

              {request.status === "failed" &&
              (request.accessMode === "premium" || request.paidAt) ? (
                <form
                  action={`/api/scheme-requests/${request.id}/retry`}
                  method="post"
                >
                  <button
                    type="submit"
                    className="scheme-bot-button-primary"
                  >
                    Build again
                  </button>
                </form>
              ) : null}

              <Link href="/scheme-bot" className="scheme-bot-button-secondary">
                Back to Scheme Bot
              </Link>
            </div>
          </div>

          <div className="scheme-bot-preview-panel">
            <div className="scheme-bot-preview-glow" />
            <div className="relative">
              <span className="scheme-bot-chip scheme-bot-chip-dark">
                Document summary
              </span>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="scheme-bot-preview-stat">
                  <p className="scheme-bot-field-mini-label">Teacher</p>
                  <p className="mt-2 text-lg font-bold text-slate-950">
                    {request.teacherName || "Not added"}
                  </p>
                </div>
                <div className="scheme-bot-preview-stat">
                  <p className="scheme-bot-field-mini-label">School</p>
                  <p className="mt-2 text-lg font-bold text-slate-950">
                    {request.schoolName || "Not added"}
                  </p>
                </div>
                <div className="scheme-bot-preview-stat">
                  <p className="scheme-bot-field-mini-label">
                    {getDocumentCountHeading(request)}
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-950">
                    {getTeacherDocumentRowCount(request)}
                  </p>
                </div>
                <div className="scheme-bot-preview-stat">
                  <p className="scheme-bot-field-mini-label">Textbook</p>
                  <p className="mt-2 text-lg font-bold text-slate-950">
                    {request.textbook || "Not added"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] bg-white/12 p-5 ring-1 ring-white/18 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                  Status
                </p>
                <p className="mt-2 text-xl font-bold text-white">
                  {request.status === "completed"
                    ? "Ready to download"
                    : request.status === "failed"
                      ? "Needs another try"
                      : "Still preparing"}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/78">
                  {request.status === "completed"
                    ? "This document is ready."
                    : request.status === "failed"
                      ? "You can build this document again."
                      : "Refresh shortly."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {canCreateFollowUps ? (
          <section className="scheme-bot-surface-card mt-8 p-7 sm:p-8">
            <span className="scheme-bot-chip">Next step</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
              Create lesson plan
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              {followUpKinds.map((item) => (
                <form
                  key={item.outputKind}
                  action={`/api/scheme-requests/${request.id}/create-follow-up`}
                  method="post"
                  className="scheme-bot-note-card"
                >
                  <input type="hidden" name="output_kind" value={item.outputKind} />
                  <p className="scheme-bot-field-mini-label">Follow-up</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-950">
                    {getTeacherDocumentKindLabel(item.outputKind)}
                  </h3>
                  <button type="submit" className="scheme-bot-button-primary mt-5">
                    {hasUnlimitedAccess ? item.premiumLabel : item.paidLabel}
                  </button>
                </form>
              ))}
            </div>
          </section>
        ) : null}

        {request.generatedContent ? (
          <section className="scheme-bot-surface-card mt-8 p-7 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="scheme-bot-chip">Preview</span>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                  {`${documentLabel} preview`}
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                {request.generatedOverview || request.generatedContent.subtitle}
              </p>
            </div>
            {isSchemePreview(request.generatedContent)
              ? renderSchemePreview(request.generatedContent)
              : null}
            {isLessonPlanPreview(request.generatedContent)
              ? renderLessonPlanPreview(request.generatedContent)
              : null}
            {isAssessmentPreview(request.generatedContent)
              ? renderAssessmentPreview(request.generatedContent)
              : null}
            {isMarkingSchemePreview(request.generatedContent)
              ? renderMarkingSchemePreview(request.generatedContent)
              : null}
            {isLessonNotesPreview(request.generatedContent)
              ? renderLessonNotesPreview(request.generatedContent)
              : null}
          </section>
        ) : request.status === "failed" ? (
          <section className="scheme-bot-error-card mt-8">
            <h2 className="text-xl font-bold text-slate-950">
              {getFailedHeading(request)}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {request.errorMessage ||
                "We could not finish the document right now. Please try again shortly."}
            </p>
          </section>
        ) : (
          <section className="scheme-bot-pending-card mt-8">
            <h2 className="text-xl font-bold text-slate-950">
              {getPendingHeading(request)}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Refresh shortly to check the final document.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
