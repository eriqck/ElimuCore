import Link from "next/link";
import type { Resource } from "@/lib/types";

type ResourceCardProps = {
  resource: Resource;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const accessLabel =
    resource.access === "Premium" ? "Member Access" : "Free Preview";

  return (
    <article className="group rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-rose-700 hover:bg-rose-900 hover:text-white hover:shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-900 transition group-hover:bg-white group-hover:text-rose-900">
          {resource.level}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700 transition group-hover:bg-white/15 group-hover:text-white">
          {resource.category}
        </span>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-stone-600 transition group-hover:bg-white/15 group-hover:text-rose-100">
          {accessLabel}
        </span>
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900 transition group-hover:text-white">
        {resource.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600 transition group-hover:text-rose-100">
        {resource.summary}
      </p>

      <div className="mt-6 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 transition group-hover:bg-white/10">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition group-hover:text-rose-100">
            Subject
          </span>
          <span className="mt-1 block font-medium text-slate-700 transition group-hover:text-white">
            {resource.subject}
          </span>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 transition group-hover:bg-white/10">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition group-hover:text-rose-100">
            Format
          </span>
          <span className="mt-1 block font-medium text-slate-700 transition group-hover:text-white">
            {resource.format}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-500 transition group-hover:text-rose-100">
          {resource.year ? `${resource.year} edition` : "Always available"}
        </p>
        <Link
          href={`/resources/${resource.slug}`}
          className="rounded-full px-3 py-2 text-sm font-semibold text-rose-900 transition group-hover:bg-white/10 group-hover:text-white hover:bg-white hover:text-rose-900"
        >
          Open -&gt;
        </Link>
      </div>
    </article>
  );
}
