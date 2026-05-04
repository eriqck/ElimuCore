import Link from "next/link";
import type { Metadata } from "next";
import { ResourceCard } from "@/components/resources/resource-card";
import { getCurrentMemberContext, hasPremiumAccess } from "@/lib/membership";
import {
  getLibraryFilters,
  getResourceLevelBrowseCards,
  listResources,
  normalizeResourceBrowseSlug
} from "@/lib/resources";

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
  const normalizedLevel = normalizeResourceBrowseSlug(level);

  const resourcesPromise = normalizedLevel || query || category
    ? listResources(query, category, normalizedLevel ?? undefined)
    : Promise.resolve([]);

  const [resources, filters, levelCards, memberContext] = await Promise.all([
    resourcesPromise,
    getLibraryFilters(),
    getResourceLevelBrowseCards(),
    getCurrentMemberContext()
  ]);
  const canOpenLibrary = hasPremiumAccess(memberContext);
  const selectedLevel =
    levelCards.find((item) => item.slug === normalizedLevel) ?? null;

  const createLevelHref = (nextLevel: string) => {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    nextParams.set("level", nextLevel);
    return `/resources?${nextParams.toString()}`;
  };

  const createResetHref = () => {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    if (category) {
      nextParams.set("category", category);
    }

    const serialized = nextParams.toString();
    return serialized ? `/resources?${serialized}` : "/resources";
  };

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

  if (!canOpenLibrary) {
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
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/60 surface-card">
        <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-14">
          <div>
            <p className="brand-kicker text-sm font-bold uppercase tracking-[0.24em]">
              Member library
            </p>
            <h1 className="font-display mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Browse by school level
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">
              Pick a level card first, then open the right materials for that
              level.
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
                {selectedLevel ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                      Selected section
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {selectedLevel.title}
                    </p>
                    <Link
                      href={createResetHref()}
                      className="mt-3 inline-flex text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                    >
                      Clear level filter
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      Level first
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Choose a level below to open its materials.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
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
              Levels
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Choose where to browse
            </h2>
          </div>
          {selectedLevel ? (
            <p className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
              Showing {selectedLevel.title}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {levelCards.map((card, index) => {
            const active = card.slug === level;
            const accents = [
              "from-rose-500 to-orange-400",
              "from-emerald-500 to-lime-400",
              "from-sky-500 to-cyan-400",
              "from-violet-500 to-fuchsia-400"
            ];
            const accent = accents[index % accents.length];

            return (
              <Link
                key={card.slug}
                href={createLevelHref(card.slug)}
                className={`group relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] ${
                  active
                    ? "border-emerald-300 ring-2 ring-emerald-200"
                    : "border-stone-200"
                }`}
              >
                <div
                  className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl transition group-hover:opacity-40`}
                />
                <div className="relative">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                      active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {card.count} material{card.count === 1 ? "" : "s"}
                  </span>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {card.subtitle}
                  </p>
                  <span className="mt-6 inline-flex text-sm font-semibold text-rose-900 transition group-hover:text-emerald-700">
                    Open level -&gt;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="brand-kicker text-sm font-semibold uppercase tracking-[0.2em]">
              Results
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {selectedLevel
                ? `${selectedLevel.title} resources (${resources.length})`
                : query || category
                  ? `${resources.length} matching resources`
                : `${resources.length} resources`}
            </h2>
          </div>
          <Link
            href="/"
            className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-rose-900 hover:text-white"
          >
            Back to ELimuCore
          </Link>
        </div>

        {!selectedLevel && !query && !category ? (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/85 p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">
              Choose a school level
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Each level card opens only the materials for that group.
            </p>
          </div>
        ) : resources.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
