import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentMemberContext, hasAdminAccess } from "@/lib/membership";
import { getSchemeRequestById, getSchemeRequestForUser } from "@/lib/scheme-bot";

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

  const headings =
    request.language === "sw"
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
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/60 surface-card p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3">
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
          {request.classLabel} {request.subject}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {`Term ${request.term} • ${request.year}`}
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
              Weeks
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {request.weeksInTerm}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Lessons / week
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {request.lessonsPerWeek}
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
                Retry generation
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

        {request.generatedContent ? (
          <section className="mt-10 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Generated plan preview
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {request.generatedOverview || request.generatedContent.subtitle}
            </p>
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
                  {request.generatedContent.rows.slice(0, 6).map((row, index) => (
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
          </section>
        ) : request.status === "failed" ? (
          <section className="mt-10 rounded-[2rem] border border-rose-200 bg-rose-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Generation needs another try
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {request.errorMessage ||
                "We could not finish the document right now. Please try again shortly."}
            </p>
          </section>
        ) : (
          <section className="mt-10 rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Processing your scheme
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              This request is still being prepared. Refresh shortly to check the
              final document.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
