import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResourceBySlug } from "@/lib/resources";

type ResourceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params
}: ResourceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);

  if (!resource) {
    return {
      title: "Resource not found"
    };
  }

  return {
    title: resource.title,
    description: resource.summary
  };
}

export default async function ResourceDetailPage({
  params
}: ResourceDetailPageProps) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  const accessLabel =
    resource?.access === "Premium" ? "Member Access" : "Free Preview";

  if (!resource) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/60 surface-card p-6 sm:p-8 lg:p-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-900">
            {resource.level}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            {resource.category}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
            {accessLabel}
          </span>
        </div>

        <h1 className="font-display mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          {resource.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          {resource.description}
        </p>

        <div className="brand-band mt-8 grid gap-4 rounded-[2rem] p-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              Subject
            </p>
            <p className="mt-2 text-lg font-bold">{resource.subject}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              Year
            </p>
            <p className="mt-2 text-lg font-bold">
              {resource.year ? resource.year : "Flexible"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              Format
            </p>
            <p className="mt-2 text-lg font-bold">{resource.format}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 p-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Downloads and delivery
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Attach the actual PDF, ZIP, or note file in Supabase Storage and
            save the storage path into the <code>resource_files</code> table so
            teachers and parents always reach the latest version from one clean
            page. Active members can download the resources they need without
            extra charges while their membership is valid.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/resources"
            className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Back to the library
          </Link>
          <Link
            href="/"
            className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
