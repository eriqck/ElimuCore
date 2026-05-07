import Link from "next/link";
import { MarketingEvent } from "@/components/marketing/marketing-event";
import { SchemeGeneratorForm } from "@/components/schemes/scheme-generator-form";
import { getCurrentMemberContext } from "@/lib/membership";
import {
  getTeacherDocumentPreviewTitle,
  getTeacherDocumentRowCount,
  hasUnlimitedSchemeAccess,
  listUserSchemeRequests
} from "@/lib/scheme-bot";
import { getTeacherDocumentKindLabel } from "@/lib/teacher-documents";

type SchemeBotPageProps = {
  searchParams?: Promise<{
    notice?: string;
  }>;
};

const outputPreview = [
  "Scheme of work",
  "Lesson plan",
  "Assessment",
  "Marking scheme",
  "Lesson notes"
];

const workflowSteps = [
  {
    title: "Choose your class and subject",
    body: "Pick the level, class, term, subject, and book reference your school is already using."
  },
  {
    title: "Build one clean base document",
    body: "Start with a structured scheme that stays aligned with your class level and textbook."
  },
  {
    title: "Open follow-up documents faster",
    body: "Turn the same scheme into a lesson plan, assessment, notes, or marking guide without restarting."
  }
];

const builderHighlights = [
  {
    title: "Built for real classroom planning",
    body: "Use real book references, term details, and class information before you download."
  },
  {
    title: "Easy for premium and one-time use",
    body: "Premium teachers build freely. One-time teachers can pay KSh 20 only when they need one document."
  },
  {
    title: "Clean downloadable Word format",
    body: "Every document is prepared as a DOCX file that is easy to edit before printing or sharing."
  }
];

function formatStageLabel(stage: string) {
  if (stage === "pre-primary") {
    return "Pre-Primary";
  }

  if (stage === "senior-school") {
    return "Senior School";
  }

  return "Junior School";
}

function getDocumentCountLabel(outputKind: string) {
  if (outputKind === "assessment") {
    return "questions";
  }

  if (outputKind === "marking-scheme") {
    return "answers";
  }

  if (outputKind === "lesson-plan") {
    return "lessons";
  }

  if (outputKind === "lesson-notes") {
    return "notes";
  }

  return "weeks";
}

function PreviewPanel() {
  return (
    <div className="scheme-bot-preview-panel">
      <div className="scheme-bot-preview-glow" />
      <div className="relative">
        <span className="scheme-bot-chip scheme-bot-chip-dark">
          Teacher workflow
        </span>
        <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
          One scheme.
          <span className="block text-white/72">Many classroom documents.</span>
        </h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-white/82">
          Build your scheme first, then open lesson plans, assessments,
          marking guides, and notes from the same planning path.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {outputPreview.map((item, index) => (
            <div key={item} className="scheme-bot-preview-tile">
              <span className="scheme-bot-preview-index">{`0${index + 1}`}</span>
              <p className="text-sm font-semibold text-slate-900">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-[2rem] bg-white/12 p-5 ring-1 ring-white/18 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                Access
              </p>
              <p className="mt-2 text-xl font-bold text-white">
                Premium or pay once
              </p>
            </div>
            <div className="rounded-full bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
              DOCX
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="scheme-bot-preview-stat">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Premium
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                Unlimited use
              </p>
            </div>
            <div className="scheme-bot-preview-stat">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                One time
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">KSh 20</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function SchemeBotPage({
  searchParams
}: SchemeBotPageProps) {
  const params = (await searchParams) ?? {};
  const notice =
    typeof params.notice === "string" ? decodeURIComponent(params.notice) : "";
  const memberContext = await getCurrentMemberContext();

  if (!memberContext.user) {
    return (
      <main className="scheme-bot-stage min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <MarketingEvent
          eventName="OpenSchemeBot"
          dedupeKey="scheme-bot:public"
          payload={{
            content_name: "Scheme Bot",
            content_category: "teacher_tools",
            access: "public"
          }}
        />
        <section className="mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="scheme-bot-surface-card p-7 sm:p-10">
              <span className="scheme-bot-chip">Scheme Bot</span>
              <h1 className="mt-6 max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Create teacher documents faster with one clean workflow.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                Sign in first, then choose your class, subject, and term.
                Premium teachers build freely. One-time purchases are charged
                only when you continue to document checkout.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/login?next=${encodeURIComponent("/scheme-bot")}`}
                  className="scheme-bot-button-primary"
                >
                  Login
                </Link>
                <Link href="/signup" className="scheme-bot-button-secondary">
                  Create account
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="scheme-bot-metric-card">
                  <p className="scheme-bot-metric-label">Premium</p>
                  <p className="scheme-bot-metric-value">Unlimited</p>
                </div>
                <div className="scheme-bot-metric-card">
                  <p className="scheme-bot-metric-label">One time</p>
                  <p className="scheme-bot-metric-value">KSh 20</p>
                </div>
                <div className="scheme-bot-metric-card">
                  <p className="scheme-bot-metric-label">Output</p>
                  <p className="scheme-bot-metric-value">DOCX</p>
                </div>
              </div>
            </div>

            <PreviewPanel />
          </div>
        </section>
      </main>
    );
  }

  const requests = await listUserSchemeRequests(memberContext.user.id);
  const hasUnlimitedAccess = hasUnlimitedSchemeAccess(memberContext);
  const teacherName =
    memberContext.profile?.fullName?.trim() ||
    memberContext.user.email.split("@")[0] ||
    "Teacher";

  return (
    <main className="scheme-bot-stage min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <MarketingEvent
        eventName="OpenSchemeBot"
        dedupeKey={`scheme-bot:${hasUnlimitedAccess ? "premium" : "single-purchase"}`}
        payload={{
          content_name: "Scheme Bot",
          content_category: "teacher_tools",
          access: hasUnlimitedAccess ? "premium" : "single_purchase"
        }}
      />

      <section className="mx-auto max-w-7xl">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="scheme-bot-surface-card p-7 sm:p-10">
            <span className="scheme-bot-chip">Scheme Bot</span>
            <h1 className="mt-6 max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Build one planning document.
              <span className="scheme-bot-gradient-text block">
                Open the rest from it.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Prepare a scheme first, then keep moving into lesson plans,
              assessments, notes, and marking guides without repeating the
              whole setup again.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#scheme-bot-builder" className="scheme-bot-button-primary">
                Start building
              </a>
              <a href="#scheme-bot-requests" className="scheme-bot-button-secondary">
                View recent work
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="scheme-bot-metric-card">
                <p className="scheme-bot-metric-label">Premium teachers</p>
                <p className="scheme-bot-metric-value">Unlimited use</p>
              </div>
              <div className="scheme-bot-metric-card">
                <p className="scheme-bot-metric-label">Single document</p>
                <p className="scheme-bot-metric-value">KSh 20</p>
              </div>
              <div className="scheme-bot-metric-card">
                <p className="scheme-bot-metric-label">Workflow</p>
                <p className="scheme-bot-metric-value">5 outputs</p>
              </div>
            </div>

            {notice ? (
              <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-900">
                {notice}
              </div>
            ) : null}
          </div>

          <PreviewPanel />
        </div>
      </section>

      <section
        id="scheme-bot-builder"
        className="mx-auto mt-10 grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="scheme-bot-surface-card p-3 sm:p-4">
          <SchemeGeneratorForm
            teacherName={teacherName}
            hasUnlimitedAccess={hasUnlimitedAccess}
          />
        </div>

        <div className="grid gap-6">
          <article className="scheme-bot-dark-card">
            <span className="scheme-bot-chip scheme-bot-chip-dark">
              How it works
            </span>
            <div className="mt-6 space-y-4">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="scheme-bot-step-card">
                  <span className="scheme-bot-step-index">{index + 1}</span>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-white/76">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="scheme-bot-surface-card p-7">
            <span className="scheme-bot-chip">Teacher support</span>
            <div className="mt-6 grid gap-4">
              {builderHighlights.map((item) => (
                <div key={item.title} className="scheme-bot-note-card">
                  <h2 className="text-base font-bold text-slate-950">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="scheme-bot-requests" className="mx-auto mt-12 max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="scheme-bot-chip">My documents</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
              Recent teacher work
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Reopen a completed document, download it, or continue into the next
            planning step.
          </p>
        </div>

        {requests.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {requests.map((request) => (
              <article key={request.id} className="scheme-bot-request-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="scheme-bot-tag scheme-bot-tag-primary">
                    {getTeacherDocumentKindLabel(request.outputKind)}
                  </span>
                  <span className="scheme-bot-tag scheme-bot-tag-soft">
                    {formatStageLabel(request.stage)}
                  </span>
                  <span className="scheme-bot-tag scheme-bot-tag-neutral">
                    {request.status.replaceAll("_", " ")}
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                  {getTeacherDocumentPreviewTitle(request)}
                </h3>
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  {`Term ${request.term} - ${request.year}`}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {request.generatedOverview ||
                    `Open this ${getTeacherDocumentKindLabel(request.outputKind).toLowerCase()} to download it or continue to the next step.`}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="scheme-bot-inline-stat">
                    <p className="scheme-bot-inline-label">Rows</p>
                    <p className="scheme-bot-inline-value">
                      {getTeacherDocumentRowCount(request)}
                    </p>
                  </div>
                  <div className="scheme-bot-inline-stat">
                    <p className="scheme-bot-inline-label">Type</p>
                    <p className="scheme-bot-inline-value">
                      {getDocumentCountLabel(request.outputKind)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/scheme-bot/${request.id}`}
                    className="scheme-bot-button-primary"
                  >
                    Open request
                  </Link>
                  {request.status === "completed" ? (
                    <Link
                      href={`/api/scheme-requests/${request.id}/download`}
                      className="scheme-bot-button-secondary"
                    >
                      Download
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="scheme-bot-empty-card mt-7">
            <h3 className="text-2xl font-black text-slate-950">
              No teacher documents yet
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Start with one scheme today, then use it to open lesson plans,
              assessments, notes, and marking guides later.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
