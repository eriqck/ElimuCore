import { cache } from "react";
import {
  fallbackHomePageData,
  fallbackLibraryFilters,
  fallbackResources,
  fallbackSchoolLevels
} from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  HomePageData,
  LibraryFilters,
  Resource,
  ResourceDetail,
  ResourceFile,
  ResourceFileKind,
  ResourceLevelBrowseCard,
  SchoolLevel
} from "@/lib/types";

type SchoolLevelRow = {
  slug: string;
  title: string;
  subtitle: string;
  sort_order: number;
};

type CategoryRow = {
  slug: string;
  name: string;
  sort_order: number;
};

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

type ResourceFileRow = {
  id: string;
  label: string;
  file_kind: ResourceFileKind;
  bucket_path: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  created_at: string | null;
};

function cleanText(value: string | null | undefined, fallback: string) {
  const normalized = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || fallback;
}

function formatFileSize(bytes: number | null) {
  if (!bytes || bytes <= 0) {
    return null;
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const precision = size >= 100 || unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
}

function escapeSearchTerm(query: string) {
  return query.replace(/[%(),]/g, " ").trim();
}

function getResourceLookups(filters: LibraryFilters) {
  return {
    levelLookup: new Map(filters.levels.map((item) => [item.slug, item.title])),
    categoryLookup: new Map(
      filters.categories.map((item) => [item.slug, item.name])
    )
  };
}

function normalizeResource(
  row: ResourceRow,
  filters: LibraryFilters
): Resource {
  const { levelLookup, categoryLookup } = getResourceLookups(filters);
  const levelSlug = row.school_level_slug ?? "secondary-school";
  const categorySlug = row.category_slug ?? "notes";

  return {
    id: row.id,
    slug: row.slug,
    title: cleanText(row.title, "Untitled resource"),
    summary: cleanText(row.summary, "A published education resource."),
    description: cleanText(
      row.description ?? row.summary,
      "A published education resource."
    ),
    level: levelLookup.get(levelSlug) ?? "Secondary School",
    levelSlug,
    category: categoryLookup.get(categorySlug) ?? "Notes",
    categorySlug,
    subject: cleanText(row.subject, "General"),
    access: row.access === "premium" ? "Premium" : "Free",
    format: cleanText(row.format, "PDF"),
    year: row.resource_year,
    term: row.term,
    featured: Boolean(row.featured),
    storagePath: row.storage_path,
    sourceUrl: row.source_url
  };
}

function normalizeFile(row: ResourceFileRow): ResourceFile {
  return {
    id: row.id,
    label: cleanText(row.label, "Library download"),
    fileKind: row.file_kind,
    bucketPath: row.bucket_path,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    fileSizeLabel: formatFileSize(row.file_size_bytes),
    createdAt: row.created_at
  };
}

function filterFallbackResources(
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

function mergeHomepageLevels(levels: LibraryFilters["levels"]): SchoolLevel[] {
  const liveLookup = new Map(levels.map((item) => [item.slug, item]));

  return fallbackSchoolLevels.map((level) => {
    const liveLevel = liveLookup.get(level.slug);

    if (!liveLevel) {
      return level;
    }

    return {
      ...level,
      title: liveLevel.title,
      subtitle: liveLevel.subtitle ?? level.subtitle
    };
  });
}

const getSupabaseFilters = cache(async (): Promise<LibraryFilters> => {
  if (!hasSupabaseEnv()) {
    return fallbackLibraryFilters;
  }

  try {
    const supabase = await createClient();
    const [levelsResponse, categoriesResponse] = await Promise.all([
      supabase
        .from("school_levels")
        .select("slug, title, subtitle, sort_order")
        .order("sort_order", { ascending: true }),
      supabase
        .from("resource_categories")
        .select("slug, name, sort_order")
        .order("sort_order", { ascending: true })
    ]);

    if (
      levelsResponse.error ||
      categoriesResponse.error ||
      !levelsResponse.data ||
      !categoriesResponse.data
    ) {
      return fallbackLibraryFilters;
    }

    const levels = (levelsResponse.data as SchoolLevelRow[]).map((level) => ({
      slug: level.slug,
      title: level.title,
      subtitle: level.subtitle
    }));
    const categories = (categoriesResponse.data as CategoryRow[]).map(
      (category) => ({
        slug: category.slug,
        name: category.name
      })
    );

    return {
      levels: levels.length > 0 ? levels : fallbackLibraryFilters.levels,
      categories:
        categories.length > 0 ? categories : fallbackLibraryFilters.categories
    };
  } catch {
    return fallbackLibraryFilters;
  }
});

async function getSupabaseResources(
  query?: string,
  category?: string,
  level?: string
) {
  if (!hasSupabaseEnv()) {
    return filterFallbackResources(fallbackResources, query, category, level);
  }

  try {
    const supabase = await createClient();
    const filters = await getSupabaseFilters();
    let request = supabase
      .from("resources")
      .select(
        "id, slug, title, summary, description, school_level_slug, category_slug, subject, access, format, resource_year, term, featured, storage_path, source_url"
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("resource_year", { ascending: false, nullsFirst: false })
      .order("title", { ascending: true })
      .limit(500);

    if (category) {
      request = request.eq("category_slug", category);
    }

    if (level) {
      request = request.eq("school_level_slug", level);
    }

    if (query) {
      const searchTerm = escapeSearchTerm(query);
      if (searchTerm) {
        request = request.or(
          [
            `title.ilike.%${searchTerm}%`,
            `summary.ilike.%${searchTerm}%`,
            `description.ilike.%${searchTerm}%`,
            `subject.ilike.%${searchTerm}%`
          ].join(",")
        );
      }
    }

    const { data, error } = await request;

    if (error || !data) {
      return filterFallbackResources(fallbackResources, query, category, level);
    }

    return (data as ResourceRow[]).map((row) => normalizeResource(row, filters));
  } catch {
    return filterFallbackResources(fallbackResources, query, category, level);
  }
}

export const getLibraryFilters = cache(async (): Promise<LibraryFilters> => {
  return getSupabaseFilters();
});

export const getResourceLevelBrowseCards = cache(
  async (): Promise<ResourceLevelBrowseCard[]> => {
    const filters = await getSupabaseFilters();

    if (!hasSupabaseEnv()) {
      const counts = new Map<string, number>();

      for (const resource of fallbackResources) {
        counts.set(
          resource.levelSlug,
          (counts.get(resource.levelSlug) ?? 0) + 1
        );
      }

      return filters.levels.map((level) => ({
        slug: level.slug,
        title: level.title,
        subtitle: level.subtitle ?? "Browse resources for this level.",
        count: counts.get(level.slug) ?? 0
      }));
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("resources")
        .select("school_level_slug")
        .eq("published", true)
        .limit(1000);

      if (error || !data) {
        throw error ?? new Error("Could not load resource level counts.");
      }

      const counts = new Map<string, number>();

      for (const row of data as Array<{ school_level_slug: string | null }>) {
        const slug = row.school_level_slug ?? "secondary-school";
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      }

      return filters.levels.map((level) => ({
        slug: level.slug,
        title: level.title,
        subtitle: level.subtitle ?? "Browse resources for this level.",
        count: counts.get(level.slug) ?? 0
      }));
    } catch {
      const counts = new Map<string, number>();

      for (const resource of fallbackResources) {
        counts.set(
          resource.levelSlug,
          (counts.get(resource.levelSlug) ?? 0) + 1
        );
      }

      return filters.levels.map((level) => ({
        slug: level.slug,
        title: level.title,
        subtitle: level.subtitle ?? "Browse resources for this level.",
        count: counts.get(level.slug) ?? 0
      }));
    }
  }
);

export const listResources = cache(
  async (query?: string, category?: string, level?: string) => {
    return getSupabaseResources(query, category, level);
  }
);

export const getResourceBySlug = cache(
  async (slug: string): Promise<ResourceDetail | null> => {
    if (!hasSupabaseEnv()) {
      const fallbackResource = fallbackResources.find(
        (resource) => resource.slug === slug
      );

      return fallbackResource ? { ...fallbackResource, files: [] } : null;
    }

    try {
      const supabase = await createClient();
      const filters = await getSupabaseFilters();
      const { data: resourceRow, error: resourceError } = await supabase
        .from("resources")
        .select(
          "id, slug, title, summary, description, school_level_slug, category_slug, subject, access, format, resource_year, term, featured, storage_path, source_url"
        )
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (resourceError || !resourceRow) {
        const fallbackResource = fallbackResources.find(
          (resource) => resource.slug === slug
        );

        return fallbackResource ? { ...fallbackResource, files: [] } : null;
      }

      const { data: fileRows, error: filesError } = await supabase
        .from("resource_files")
        .select(
          "id, label, file_kind, bucket_path, mime_type, file_size_bytes, created_at"
        )
        .eq("resource_id", resourceRow.id)
        .order("created_at", { ascending: true });

      const normalizedResource = normalizeResource(
        resourceRow as ResourceRow,
        filters
      );

      return {
        ...normalizedResource,
        files:
          !filesError && fileRows
            ? (fileRows as ResourceFileRow[]).map((row) => normalizeFile(row))
            : []
      };
    } catch {
      const fallbackResource = fallbackResources.find(
        (resource) => resource.slug === slug
      );

      return fallbackResource ? { ...fallbackResource, files: [] } : null;
    }
  }
);

export const getHomepageData = cache(async (): Promise<HomePageData> => {
  const [resources, filters] = await Promise.all([
    getSupabaseResources(),
    getSupabaseFilters()
  ]);
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
    schoolLevels: mergeHomepageLevels(filters.levels),
    categories: filters.categories.slice(0, 8),
    featuredResources:
      featuredResources.length > 0
        ? featuredResources
        : fallbackHomePageData.featuredResources
  };
});
