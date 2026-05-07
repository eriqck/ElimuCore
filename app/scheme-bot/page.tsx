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

const outputPreview = ["Scheme of Work", "Lesson Plan"];

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
          Scheme of Work
          <span className="block text-white/72">Lesson Plan</span>
        </h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-white/82">
          Start with your scheme, then open the matching lesson plan.
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
                Premium or one time
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
                Scheme of Work.
                <span className="scheme-bot-gradient-text block">
                  Lesson Plan.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                Sign in to start.
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

  const requests = (await listUserSchemeRequests(memberContext.user.id)).filter(
    (request) =>
      request.outputKind === "scheme" || request.outputKind === "lesson-plan"
  );
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
              Scheme of Work.
              <span className="scheme-bot-gradient-text block">
                Lesson Plan.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Build what you need.
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
                <p className="scheme-bot-metric-label">Outputs</p>
                <p className="scheme-bot-metric-value">2</p>
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
        <div className="scheme-bot-dark-card flex items-center justify-center p-7 sm:p-10">
          <div className="w-full max-w-md">
            <span className="scheme-bot-chip scheme-bot-chip-dark">
              Included
            </span>
            <div className="mt-6 grid gap-4">
              <div className="scheme-bot-step-card">
                <span className="scheme-bot-step-index">1</span>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Scheme of Work
                  </h2>
                </div>
              </div>
              <div className="scheme-bot-step-card">
                <span className="scheme-bot-step-index">2</span>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Lesson Plan
                  </h2>
                </div>
              </div>
            </div>
          </div>
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
                    `Open this ${getTeacherDocumentKindLabel(request.outputKind).toLowerCase()} to download it.`}
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
          </div>
        )}
      </section>
    </main>
  );
}
