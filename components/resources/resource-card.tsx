import Link from "next/link";
import type { Resource } from "@/lib/types";

type ResourceCardProps = {
  resource: Resource;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const accessLabel =
    resource.access === "Premium" ? "Member Access" : "Free Preview";

  return (
    <article className="group flex h-full flex-col rounded-[2rem] border border-stone-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:border-rose-700 hover:bg-rose-900 hover:text-white hover:shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <span className="rounded-full bg-rose-100 px-3 py-1 text-center text-xs font-bold uppercase tracking-[0.18em] text-rose-900 transition group-hover:bg-white group-hover:text-rose-900">
          {resource.level}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-center text-xs font-bold uppercase tracking-[0.18em] text-amber-700 transition group-hover:bg-white/15 group-hover:text-white">
          {resource.category}
        </span>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-center text-xs font-bold uppercase tracking-[0.18em] text-stone-600 transition group-hover:bg-white/15 group-hover:text-rose-100">
          {accessLabel}
        </span>
      </div>

      <div className="mt-5 flex-1 text-center sm:text-left">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 transition group-hover:text-white">
          {resource.title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 transition group-hover:text-rose-100">
          {resource.summary}
        </p>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center transition group-hover:bg-white/10 sm:text-left">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition group-hover:text-rose-100">
            Subject
          </span>
          <span className="mt-1 block font-medium text-slate-700 transition group-hover:text-white">
            {resource.subject}
          </span>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center transition group-hover:bg-white/10 sm:text-left">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition group-hover:text-rose-100">
            Format
          </span>
          <span className="mt-1 block font-medium text-slate-700 transition group-hover:text-white">
            {resource.format}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-sm text-slate-500 transition group-hover:text-rose-100 sm:text-left">
          {resource.year ? `${resource.year} edition` : "Always available"}
        </p>
        <Link
          href={`/resources/${resource.slug}`}
          className="rounded-full px-3 py-2 text-center text-sm font-semibold text-rose-900 transition group-hover:bg-white/10 group-hover:text-white hover:bg-white hover:text-rose-900"
        >
          Open -&gt;
        </Link>
      </div>
    </article>
  );
}
