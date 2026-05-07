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
  LessonPlanDocumentContent,
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
  return Boolean(content && "sections" in content);
}

function getDocumentCountHeading(request: SchemeRequest) {
  if (request.outputKind === "assessment") {
    return "Questions";
  }

  if (request.outputKind === "lesson-plan") {
    return "Lessons";
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
      <table className="min-w-full border-collapse overflow-hidden rounded-2xl border border-stone-200">
        <thead className="bg-emerald-50">
          <tr>
            {headings.map((heading) => (
              <th
                key={heading}
                className="border border-stone-200 px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-700"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.rows.slice(0, 6).map((row, index) => (
            <tr key={`${row.weekLabel}-${row.lessonLabel}-${index}`}>
              <td className="border border-stone-200 px-3 py-3 text-sm text-slate-700">
                {row.weekLabel}
              </td>
              <td className="border border-stone-200 px-3 py-3 text-sm text-slate-700">
                {row.lessonLabel}
              </td>
              <td className="border border-stone-200 px-3 py-3 text-sm text-slate-700">
                {row.strand}
              </td>
              <td className="border border-stone-200 px-3 py-3 text-sm text-slate-700">
                {row.subStrand}
              </td>
              <td className="border border-stone-200 px-3 py-3 text-sm text-slate-700">
                {row.outcomes.join(" ")}
              </td>
              <td className="border border-stone-200 px-3 py-3 text-sm text-slate-700">
                {row.experiences.join(" ")}
              </td>
              <td className="border border-stone-200 px-3 py-3 text-sm text-slate-700">
                {row.keyInquiryQuestions.join(" ")}
              </td>
              <td className="border border-stone-200 px-3 py-3 text-sm text-slate-700">
                {row.resources.join(" ")}
              </td>
              <td className="border border-stone-200 px-3 py-3 text-sm text-slate-700">
                {row.assessment.join(" ")}
              </td>
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
        <article
          key={lesson.lessonLabel}
          className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900">
              {lesson.lessonLabel}
            </h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
              {lesson.duration}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-emerald-800">
            {lesson.focus}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Objectives
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {lesson.objectives.join(" ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Introduction
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {lesson.introduction.join(" ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Activities
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {lesson.activities.join(" ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Assessment
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {lesson.assessment.join(" ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Homework
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {lesson.homework.join(" ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Differentiation
              </p>
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
      <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-5">
        <p className="text-sm font-semibold text-emerald-900">
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
        <section
          key={section.title}
          className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5"
        >
          <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
          <p className="mt-2 text-sm italic leading-7 text-slate-600">
            {section.instructions}
          </p>
          <div className="mt-4 space-y-4">
            {section.items.slice(0, 4).map((item) => (
              <article
                key={`${section.title}-${item.numberLabel}`}
                className="rounded-[1.25rem] border border-white bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-bold text-slate-900">
                  {`${item.numberLabel} ${item.prompt}`}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {`Teacher guide: ${item.expectedAnswer}`}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
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
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/60 surface-card p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-800">
            {documentLabel}
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
            {formatStageLabel(request.stage)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
            {request.status.replaceAll("_", " ")}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
            {request.accessMode === "premium"
              ? "Premium access"
              : "Single purchase"}
          </span>
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900">
          {getTeacherDocumentPreviewTitle(request)}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {`Term ${request.term} - ${request.year}`}
        </p>

        {notice ? (
          <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-900">
            {notice}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Teacher
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {request.teacherName || "Not added"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              School
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {request.schoolName || "Not added"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {getDocumentCountHeading(request)}
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {getTeacherDocumentRowCount(request)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Textbook
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {request.textbook || "Not added"}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {request.status === "completed" ? (
            <Link
              href={`/api/scheme-requests/${request.id}/download`}
              className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
            >
              Download DOCX
            </Link>
          ) : null}
          {request.status === "failed" &&
          (request.accessMode === "premium" || request.paidAt) ? (
            <form action={`/api/scheme-requests/${request.id}/retry`} method="post">
              <button
                type="submit"
                className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
              >
                Build again
              </button>
            </form>
          ) : null}
          <Link
            href="/scheme-bot"
            className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
          >
            Back to Scheme Bot
          </Link>
        </div>

        {canCreateFollowUps ? (
          <section className="mt-10 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="brand-kicker text-sm font-semibold uppercase tracking-[0.2em]">
              Next step
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              Turn this scheme into the next teacher document
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Use this completed scheme as the base for a lesson plan or an
              assessment. You do not need to fill the planning form again.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <form
                action={`/api/scheme-requests/${request.id}/create-follow-up`}
                method="post"
              >
                <input type="hidden" name="output_kind" value="lesson-plan" />
                <button
                  type="submit"
                  className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
                >
                  {hasUnlimitedAccess
                    ? "Create lesson plan"
                    : "Create lesson plan - KSh 20"}
                </button>
              </form>
              <form
                action={`/api/scheme-requests/${request.id}/create-follow-up`}
                method="post"
              >
                <input type="hidden" name="output_kind" value="assessment" />
                <button
                  type="submit"
                  className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
                >
                  {hasUnlimitedAccess
                    ? "Create assessment"
                    : "Create assessment - KSh 20"}
                </button>
              </form>
            </div>
          </section>
        ) : null}

        {request.generatedContent ? (
          <section className="mt-10 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {`${documentLabel} preview`}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {request.generatedOverview || request.generatedContent.subtitle}
            </p>
            {isSchemePreview(request.generatedContent)
              ? renderSchemePreview(request.generatedContent)
              : null}
            {isLessonPlanPreview(request.generatedContent)
              ? renderLessonPlanPreview(request.generatedContent)
              : null}
            {isAssessmentPreview(request.generatedContent)
              ? renderAssessmentPreview(request.generatedContent)
              : null}
          </section>
        ) : request.status === "failed" ? (
          <section className="mt-10 rounded-[2rem] border border-rose-200 bg-rose-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              {getFailedHeading(request)}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {request.errorMessage ||
                "We could not finish the document right now. Please try again shortly."}
            </p>
          </section>
        ) : (
          <section className="mt-10 rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">
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
