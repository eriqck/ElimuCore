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

const ALL_RESOURCE_LEVEL_SLUGS = [
  "pre-primary",
  "primary-school",
  "junior-school",
  "secondary-school"
] as const;

type ResourceBrowseCardConfig = {
  slug: string;
  title: string;
  subtitle: string;
  levelSlugs: string[];
  categorySlug?: string | null;
  aliases?: string[];
};

const RESOURCE_BROWSE_CARD_CONFIGS: ResourceBrowseCardConfig[] = [
  {
    slug: "pre-primary",
    title: "Pre-Primary",
    subtitle: "PP1 and PP2 learning materials",
    levelSlugs: ["pre-primary"],
    aliases: ["pp1", "pp2", "pre primary"]
  },
  {
    slug: "junior-school",
    title: "Junior School",
    subtitle: "Grade 1-9 materials",
    levelSlugs: ["primary-school", "junior-school"],
    aliases: ["primary-school", "grade 1", "grade 2", "grade 3", "grade 4", "grade 5", "grade 6", "grade 7", "grade 8", "grade 9"]
  },
  {
    slug: "senior-school",
    title: "Senior School",
    subtitle: "Grade 10 and revision materials",
    levelSlugs: ["secondary-school"],
    aliases: ["secondary-school", "grade 10", "form 3", "form 4", "kcse"]
  },
  {
    slug: "ready-schemes",
    title: "Ready Schemes",
    subtitle: "Schemes of work for all subjects and levels",
    levelSlugs: [...ALL_RESOURCE_LEVEL_SLUGS],
    categorySlug: "schemes-of-work",
    aliases: ["schemes", "schemes of work", "ready schemes"]
  }
];

type ResourceQueryHints = {
  levelSlugs: string[] | null;
  categorySlug: string | null;
  searchTerm: string;
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

function stripMigrationCopy(value: string | null | undefined) {
  return cleanText(value, "")
    .replace(/Authorized migration from\s+.+?(?=(?:\s+[A-Z][A-Za-z]+(?:\s+[A-Za-z]+)*\.)|$)/i, "")
    .replace(/Material migrated from KCSE Online page:\s+.+?(?=(?:\s+[A-Z][A-Za-z]+(?:\s+[A-Za-z]+)*\.)|$)/i, "")
    .replace(/^Authorized migration from\s+.+$/i, "")
    .replace(/^Material migrated from KCSE Online page:\s+.+$/i, "")
    .trim();
}

function getDisplayLevelTitle(levelSlug: string) {
  if (levelSlug === "primary-school" || levelSlug === "junior-school") {
    return "Junior School";
  }

  if (levelSlug === "secondary-school") {
    return "Senior School";
  }

  return "Pre-Primary";
}

function decorateResourceForLibrary(resource: Resource): Resource {
  const cleanedSummary = stripMigrationCopy(resource.summary);
  const cleanedDescription = stripMigrationCopy(resource.description);

  return {
    ...resource,
    level: getDisplayLevelTitle(resource.levelSlug),
    summary:
      cleanedSummary ||
      cleanedDescription ||
      `Open this ${resource.category.toLowerCase()} resource in the member library.`,
    description:
      cleanedDescription ||
      cleanedSummary ||
      `Open this ${resource.category.toLowerCase()} resource in the member library.`
  };
}

function findBrowseCardConfig(selected: string | null | undefined) {
  const normalized = cleanText(selected, "").toLowerCase();

  if (!normalized) {
    return null;
  }

  return (
    RESOURCE_BROWSE_CARD_CONFIGS.find((card) => card.slug === normalized) ??
    RESOURCE_BROWSE_CARD_CONFIGS.find((card) =>
      (card.aliases ?? []).some((alias) => alias === normalized)
    ) ??
    null
  );
}

export function normalizeResourceBrowseSlug(selected: string | null | undefined) {
  return findBrowseCardConfig(selected)?.slug ?? (cleanText(selected, "") || null);
}

function getQueryHints(query?: string): ResourceQueryHints {
  const original = cleanText(query, "");
  let reduced = original.toLowerCase();
  let levelSlugs: string[] | null = null;
  let categorySlug: string | null = null;

  if (/\bpp\s*[12]\b|\bpre[\s-]?primary\b/i.test(reduced)) {
    levelSlugs = ["pre-primary"];
    reduced = reduced.replace(/\bpp\s*[12]\b|\bpre[\s-]?primary\b/gi, " ");
  } else if (
    /\bgrade\s*([1-9])\b|\bclass\s*([1-9])\b|\bjunior school\b/i.test(reduced)
  ) {
    levelSlugs = ["primary-school", "junior-school"];
    reduced = reduced.replace(
      /\bgrade\s*([1-9])\b|\bclass\s*([1-9])\b|\bjunior school\b/gi,
      " "
    );
  } else if (
    /\bgrade\s*10\b|\bform\s*[34]\b|\bsenior school\b|\bsecondary school\b|\bkcse\b/i.test(
      reduced
    )
  ) {
    levelSlugs = ["secondary-school"];
    reduced = reduced.replace(
      /\bgrade\s*10\b|\bform\s*[34]\b|\bsenior school\b|\bsecondary school\b|\bkcse\b/gi,
      " "
    );
  }

  if (/\bready schemes\b|\bschemes of work\b/i.test(reduced)) {
    categorySlug = "schemes-of-work";
    reduced = reduced.replace(/\bready schemes\b|\bschemes of work\b/gi, " ");
  } else if (/^\s*schemes?\s*$/i.test(reduced)) {
    categorySlug = "schemes-of-work";
    reduced = " ";
  }

  return {
    levelSlugs,
    categorySlug,
    searchTerm: escapeSearchTerm(reduced).replace(/\s+/g, " ").trim()
  };
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
  const categoryName = categoryLookup.get(categorySlug) ?? "Notes";

  return decorateResourceForLibrary({
    id: row.id,
    slug: row.slug,
    title: cleanText(row.title, "Untitled resource"),
    summary:
      stripMigrationCopy(row.summary) ||
      stripMigrationCopy(row.description ?? row.summary) ||
      `Open this ${categoryName.toLowerCase()} resource in the member library.`,
    description: cleanText(
      stripMigrationCopy(row.description ?? row.summary),
      stripMigrationCopy(row.summary) ||
        `Open this ${categoryName.toLowerCase()} resource in the member library.`
    ),
    level: levelLookup.get(levelSlug) ?? getDisplayLevelTitle(levelSlug),
    levelSlug,
    category: categoryName,
    categorySlug,
    subject: cleanText(row.subject, "General"),
    access: row.access === "premium" ? "Premium" : "Free",
    format: cleanText(row.format, "PDF"),
    year: row.resource_year,
    term: row.term,
    featured: Boolean(row.featured),
    storagePath: row.storage_path,
    sourceUrl: row.source_url
  });
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
  const selectedCard = findBrowseCardConfig(level);
  const queryHints = getQueryHints(query);
  const effectiveCategory = selectedCard?.categorySlug ?? category ?? queryHints.categorySlug;
  const effectiveLevels =
    selectedCard?.levelSlugs ??
    queryHints.levelSlugs ??
    (level ? [level] : null);
  const searchTerm = queryHints.searchTerm || cleanText(query, "");

  return resources.filter((resource) => {
    const matchesCategory = effectiveCategory
      ? resource.categorySlug === effectiveCategory
      : true;
    const matchesLevel = effectiveLevels
      ? effectiveLevels.includes(resource.levelSlug)
      : true;
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
    const matchesQuery = searchTerm
      ? haystack.includes(searchTerm.toLowerCase())
      : true;

    return matchesCategory && matchesLevel && matchesQuery;
  }).map((resource) => decorateResourceForLibrary(resource));
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
    const selectedCard = findBrowseCardConfig(level);
    const queryHints = getQueryHints(query);
    const effectiveCategory =
      selectedCard?.categorySlug ?? category ?? queryHints.categorySlug;
    const effectiveLevels =
      selectedCard?.levelSlugs ??
      queryHints.levelSlugs ??
      (level ? [level] : null);
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

    if (effectiveCategory) {
      request = request.eq("category_slug", effectiveCategory);
    }

    if (effectiveLevels?.length === 1) {
      request = request.eq("school_level_slug", effectiveLevels[0]);
    } else if (effectiveLevels && effectiveLevels.length > 1) {
      request = request.in("school_level_slug", effectiveLevels);
    }

    if (queryHints.searchTerm) {
      const searchTerm = queryHints.searchTerm;
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
    if (!hasSupabaseEnv()) {
      return RESOURCE_BROWSE_CARD_CONFIGS.map((card) => ({
        slug: card.slug,
        title: card.title,
        subtitle: card.subtitle,
        count: fallbackResources.filter(
          (resource) =>
            card.levelSlugs.includes(resource.levelSlug) &&
            (!card.categorySlug || resource.categorySlug === card.categorySlug)
        ).length,
        levelSlugs: card.levelSlugs,
        categorySlug: card.categorySlug ?? null
      }));
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("resources")
        .select("school_level_slug, category_slug")
        .eq("published", true)
        .limit(1000);

      if (error || !data) {
        throw error ?? new Error("Could not load resource level counts.");
      }

      const rows = data as Array<{
        school_level_slug: string | null;
        category_slug: string | null;
      }>;

      return RESOURCE_BROWSE_CARD_CONFIGS.map((card) => ({
        slug: card.slug,
        title: card.title,
        subtitle: card.subtitle,
        count: rows.filter((row) => {
          const levelSlug = row.school_level_slug ?? "secondary-school";
          const categorySlug = row.category_slug ?? "notes";

          return (
            card.levelSlugs.includes(levelSlug) &&
            (!card.categorySlug || categorySlug === card.categorySlug)
          );
        }).length,
        levelSlugs: card.levelSlugs,
        categorySlug: card.categorySlug ?? null
      }));
    } catch {
      return RESOURCE_BROWSE_CARD_CONFIGS.map((card) => ({
        slug: card.slug,
        title: card.title,
        subtitle: card.subtitle,
        count: fallbackResources.filter(
          (resource) =>
            card.levelSlugs.includes(resource.levelSlug) &&
            (!card.categorySlug || resource.categorySlug === card.categorySlug)
        ).length,
        levelSlugs: card.levelSlugs,
        categorySlug: card.categorySlug ?? null
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

      return fallbackResource
        ? { ...decorateResourceForLibrary(fallbackResource), files: [] }
        : null;
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

        return fallbackResource
          ? { ...decorateResourceForLibrary(fallbackResource), files: [] }
          : null;
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

      return fallbackResource
        ? { ...decorateResourceForLibrary(fallbackResource), files: [] }
        : null;
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
