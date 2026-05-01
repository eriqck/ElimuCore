import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentMemberContext, hasPremiumAccess } from "@/lib/membership";
import { getResourceBySlug } from "@/lib/resources";
import type { ResourceFile } from "@/lib/types";

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
  const memberContext = await getCurrentMemberContext();
  const accessLabel =
    resource?.access === "Premium" ? "Member Access" : "Free Preview";

  if (!resource) {
    notFound();
  }

  const canAccessDownloads = hasPremiumAccess(memberContext);
  const loginHref = `/login?next=${encodeURIComponent(`/resources/${resource.slug}`)}`;

  const formatFileKind = (file: ResourceFile) => {
    if (file.fileKind === "marking-scheme") {
      return "Marking Scheme";
    }

    if (file.fileKind === "paper") {
      return "Past Paper";
    }

    if (file.fileKind === "notes") {
      return "Notes";
    }

    if (file.fileKind === "zip") {
      return "ZIP Bundle";
    }

    if (file.fileKind === "link") {
      return "External Link";
    }

    return "Download";
  };

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

        <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Available downloads
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Files ready for active members.
              </p>
            </div>
            <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
              {resource.files.length} file
              {resource.files.length === 1 ? "" : "s"} attached
            </p>
          </div>

          {resource.files.length > 0 && canAccessDownloads ? (
            <div className="mt-6 grid gap-4">
              {resource.files.map((file) => (
                <article
                  key={file.id}
                  className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 transition hover:border-rose-700 hover:bg-rose-900 hover:text-white"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-900">
                          {formatFileKind(file)}
                        </span>
                        {file.fileSizeLabel ? (
                          <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
                            {file.fileSizeLabel}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
                        {file.label}
                      </h3>
                    </div>

                    <a
                      href={`/api/resources/${resource.slug}/download?file=${encodeURIComponent(file.id)}`}
                      className="brand-button-primary inline-flex rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      Download file
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : resource.files.length > 0 && !memberContext.user ? (
            <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Sign in to reach premium downloads
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                This page is for active members.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={loginHref}
                  className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Sign in to continue
                </Link>
                <Link
                  href="/signup"
                  className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
                >
                  Create account
                </Link>
              </div>
            </div>
          ) : resource.files.length > 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Membership activation required
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Activate your membership to download this resource.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/account"
                  className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Go to my account
                </Link>
                <Link
                  href="/#membership"
                  className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
                >
                  View membership plans
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-5">
              <p className="text-sm leading-7 text-slate-600">
                Files will appear here soon.
              </p>
            </div>
          )}
        </section>

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
