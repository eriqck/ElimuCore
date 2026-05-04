import Link from "next/link";
import { getCurrentMemberContext } from "@/lib/membership";
import {
  hasUnlimitedSchemeAccess,
  listUserSchemeRequests
} from "@/lib/scheme-bot";
import { SchemeGeneratorForm } from "@/components/schemes/scheme-generator-form";

type SchemeBotPageProps = {
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

export default async function SchemeBotPage({
  searchParams
}: SchemeBotPageProps) {
  const params = (await searchParams) ?? {};
  const notice =
    typeof params.notice === "string" ? decodeURIComponent(params.notice) : "";
  const memberContext = await getCurrentMemberContext();

  if (!memberContext.user) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
            Scheme Bot
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
            Sign in to generate schemes
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Premium members generate freely. Single-use teachers can pay KSh 20
            per scheme.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/login?next=${encodeURIComponent("/scheme-bot")}`}
              className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
            >
              Create account
            </Link>
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
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl rounded-[2rem] border border-white/60 surface-card p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
              Scheme Bot
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Generate teacher-ready schemes fast
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Choose the class, subject, term, and year. ELimuCore builds the
              scheme and prepares a Word document you can download.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Premium teachers
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  Unlimited
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Single scheme
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  KSh 20
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Export
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  DOCX
                </p>
              </div>
            </div>

            {notice ? (
              <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-900">
                {notice}
              </div>
            ) : null}
          </div>

          <SchemeGeneratorForm
            teacherName={teacherName}
            hasUnlimitedAccess={hasUnlimitedAccess}
          />
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="brand-kicker text-sm font-semibold uppercase tracking-[0.2em]">
              My schemes
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Recent requests
            </h2>
          </div>
        </div>

        {requests.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {requests.map((request) => (
              <article
                key={request.id}
                className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                    {formatStageLabel(request.stage)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
                    {request.status.replaceAll("_", " ")}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                  {request.classLabel} {request.subject}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Term {request.term} • {request.year}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {request.generatedOverview ||
                    "Open this request to download the scheme or check the latest status."}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/scheme-bot/${request.id}`}
                    className="brand-button-primary rounded-2xl px-4 py-3 text-sm font-semibold text-white transition"
                  >
                    Open request
                  </Link>
                  {request.status === "completed" ? (
                    <Link
                      href={`/api/scheme-requests/${request.id}/download`}
                      className="brand-button-secondary rounded-2xl px-4 py-3 text-sm font-semibold transition"
                    >
                      Download
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">
              No schemes yet
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Start with one subject and ELimuCore will save the generated
              document here.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
