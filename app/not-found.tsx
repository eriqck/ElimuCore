import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="max-w-xl rounded-[2rem] border border-white/60 surface-card p-8 text-center sm:p-10">
        <p className="brand-kicker text-sm font-bold uppercase tracking-[0.2em]">
          404
        </p>
        <h1 className="font-display mt-4 text-4xl font-black tracking-tight text-slate-900">
          That resource does not exist yet.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The link may be outdated, or the record has not been published in
          Supabase yet.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/resources"
            className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Browse available resources
          </Link>
        </div>
      </div>
    </main>
  );
}
