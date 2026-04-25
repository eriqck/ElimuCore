import { cache } from "react";
import {
  fallbackCategoryFilters,
  fallbackHomePageData,
  fallbackResources,
  fallbackSchoolLevels
} from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { HomePageData, Resource } from "@/lib/types";

type ResourceRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  school_level_slug: string | null;
  category_slug: string | null;
  subject: string | null;
  access: string | null;
  format: string | null;
  resource_year: number | null;
  term: string | null;
  featured: boolean | null;
  storage_path: string | null;
  source_url: string | null;
};

const levelLookup = new Map(
  fallbackSchoolLevels.map((item) => [item.slug, item.title])
);
const categoryLookup = new Map(
  fallbackCategoryFilters.map((item) => [item.slug, item.name])
);

function normalizeResource(row: ResourceRow): Resource {
  const levelSlug = row.school_level_slug ?? "secondary-school";
  const categorySlug = row.category_slug ?? "notes";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "A published education resource.",
    description:
      row.description ?? row.summary ?? "A published education resource.",
    level: levelLookup.get(levelSlug) ?? "Secondary School",
    levelSlug,
    category: categoryLookup.get(categorySlug) ?? "Notes",
    categorySlug,
    subject: row.subject ?? "General",
    access: row.access === "premium" ? "Premium" : "Free",
    format: row.format ?? "PDF",
    year: row.resource_year,
    term: row.term,
    featured: Boolean(row.featured),
    storagePath: row.storage_path,
    sourceUrl: row.source_url
  };
}

function filterResources(
  resources: Resource[],
  query?: string,
  category?: string,
  level?: string
) {
  return resources.filter((resource) => {
    const matchesCategory = category
      ? resource.categorySlug === category
      : true;
    const matchesLevel = level ? resource.levelSlug === level : true;
    const haystack = [
      resource.title,
      resource.summary,
      resource.description,
      resource.subject,
      resource.category,
      resource.level
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = query ? haystack.includes(query.toLowerCase()) : true;

    return matchesCategory && matchesLevel && matchesQuery;
  });
}

async function getSupabaseResources() {
  if (!hasSupabaseEnv()) {
    return fallbackResources;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select(
        "id, slug, title, summary, description, school_level_slug, category_slug, subject, access, format, resource_year, term, featured, storage_path, source_url"
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("resource_year", { ascending: false, nullsFirst: false })
      .limit(100);

    if (error || !data) {
      return fallbackResources;
    }

    return data.map((row) => normalizeResource(row as ResourceRow));
  } catch {
    return fallbackResources;
  }
}

export const listResources = cache(
  async (query?: string, category?: string, level?: string) => {
    const resources = await getSupabaseResources();

    return filterResources(resources, query, category, level);
  }
);

export const getResourceBySlug = cache(async (slug: string) => {
  const resources = await getSupabaseResources();

  return resources.find((resource) => resource.slug === slug) ?? null;
});

export const getHomepageData = cache(async (): Promise<HomePageData> => {
  const resources = await getSupabaseResources();
  const featuredResources = resources
    .filter((resource) => resource.featured)
    .slice(0, 4)
    .map((resource) => ({
      slug: resource.slug,
      title: resource.title,
      meta: `${resource.level} | Member access`,
      summary: resource.summary
    }));

  return {
    ...fallbackHomePageData,
    featuredResources:
      featuredResources.length > 0
        ? featuredResources
        : fallbackHomePageData.featuredResources
  };
});
