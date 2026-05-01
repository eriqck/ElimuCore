import Link from "next/link";
import type { Metadata } from "next";
import { ResourceCard } from "@/components/resources/resource-card";
import { getCurrentMemberContext } from "@/lib/membership";
import { getLibraryFilters, listResources } from "@/lib/resources";

type ResourcesPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    level?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Premium member library for ELimuCore resources."
};

export default async function ResourcesPage({
  searchParams
}: ResourcesPageProps) {
  const params = (await searchParams) ?? {};
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const category =
    typeof params.category === "string" ? params.category.trim() : "";
  const level = typeof params.level === "string" ? params.level.trim() : "";

  const [resources, filters, memberContext] = await Promise.all([
    listResources(query, category, level),
    getLibraryFilters(),
    getCurrentMemberContext()
  ]);

  if (!memberContext.user) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
            Member library
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
            Login to open resources
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This library is for active premium members.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/login?next=${encodeURIComponent("/resources")}`}
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

  if (!memberContext.activeMembership) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
            Member library
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
            Premium access needed
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Activate your membership to open the resource library.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/account"
              className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
            >
              My account
            </Link>
            <Link
              href="/"
              className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
            >
              Back home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/60 surface-card">
        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-14">
          <div>
            <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
              Member library
            </p>
            <h1 className="font-display mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Premium resources
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">
              Search, open, and download what you need.
            </p>
          </div>

          <div className="mesh-panel rounded-[2rem] border border-rose-100 p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <form className="grid gap-4">
              <div>
                <label
                  htmlFor="q"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Search the library
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={query}
                  placeholder="Grade 6 homework, Form 4 exams, lesson plans, or parent guides..."
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-700"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={category}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-700"
                  >
                    <option value="">All categories</option>
                    {filters.categories.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="level"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    School stage
                  </label>
                  <select
                    id="level"
                    name="level"
                    defaultValue={level}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-700"
                  >
                    <option value="">All levels</option>
                    {filters.levels.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="brand-button-primary rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Search resources
                </button>
                <Link
                  href="/resources"
                  className="brand-button-secondary rounded-2xl px-5 py-3 text-sm font-semibold transition"
                >
                  Reset
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="brand-kicker text-sm font-semibold uppercase tracking-[0.2em]">
              Results
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {resources.length} resources
            </h2>
          </div>
          <Link
            href="/"
            className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-rose-900 hover:text-white"
          >
            Back to ELimuCore
          </Link>
        </div>

        {resources.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.slug} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/85 p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">
              No resources matched those filters
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Try a broader grade, subject, or category search. New library
              materials will appear here as they are added.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
