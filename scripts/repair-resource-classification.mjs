import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import {
  extractSourcePageTitleFromText,
  fileKindForCategorySlug,
  inferImportedResourceMetadata
} from "./lib/resource-classification.mjs";

const manifestPath = resolve(
  process.cwd(),
  process.argv[2] ?? "data/kcseonline-launch-batch-1.json"
);

await loadEnvFile(".env.local");
await loadEnvFile(".env");

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const manifest = JSON.parse(stripBom(await readFile(manifestPath, "utf8")));
const manifestLookup = new Map(
  Array.isArray(manifest.resources)
    ? manifest.resources.map((resource) => [resource.slug, resource])
    : []
);

const supabase = createClient(projectUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const { data: resources, error: resourcesError } = await supabase
  .from("resources")
  .select(
    "id, slug, title, summary, description, school_level_slug, category_slug, subject, source_url"
  )
  .order("title", { ascending: true });

if (resourcesError || !resources) {
  console.error(`Could not load resources: ${resourcesError?.message ?? "Unknown error"}`);
  process.exit(1);
}

const updates = [];

for (const resource of resources) {
  const manifestResource = manifestLookup.get(resource.slug);
  const sourcePageTitle =
    manifestResource?.source_page_title ||
    extractSourcePageTitleFromText(resource.summary, resource.description);
  const inferred = inferImportedResourceMetadata({
    title: manifestResource?.title ?? resource.title,
    summary: manifestResource?.summary ?? resource.summary,
    description: manifestResource?.description ?? resource.description,
    sourcePageTitle,
    sourceUrl: manifestResource?.source_url ?? resource.source_url,
    launchLevel: manifestResource?.launch_level ?? null
  });

  const nextValues = {
    school_level_slug: inferred.school_level_slug,
    category_slug: inferred.category_slug,
    subject: inferred.subject
  };

  if (
    resource.school_level_slug !== nextValues.school_level_slug ||
    resource.category_slug !== nextValues.category_slug ||
    resource.subject !== nextValues.subject
  ) {
    updates.push({
      id: resource.id,
      slug: resource.slug,
      title: resource.title,
      current: {
        school_level_slug: resource.school_level_slug,
        category_slug: resource.category_slug,
        subject: resource.subject
      },
      next: nextValues
    });
  }
}

if (updates.length === 0) {
  console.log("No resource metadata changes were needed.");
} else {
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from("resources")
      .update(update.next)
      .eq("id", update.id);

    if (updateError) {
      console.warn(`Could not update ${update.slug}: ${updateError.message}`);
      continue;
    }

    const { error: fileError } = await supabase
      .from("resource_files")
      .update({
        file_kind: fileKindForCategorySlug(update.next.category_slug)
      })
      .eq("resource_id", update.id);

    if (fileError) {
      console.warn(
        `Updated ${update.slug} metadata, but file kind refresh failed: ${fileError.message}`
      );
      continue;
    }

    console.log(
      `Updated ${update.slug}: ${update.current.school_level_slug} -> ${update.next.school_level_slug}, ${update.current.category_slug} -> ${update.next.category_slug}, ${update.current.subject} -> ${update.next.subject}`
    );
  }
}

const { error: categoryError } = await supabase
  .from("resource_categories")
  .update({ name: "Assessments" })
  .eq("slug", "exams");

if (categoryError) {
  console.warn(`Could not rename exams category: ${categoryError.message}`);
} else {
  console.log('Updated resource category "exams" to display as "Assessments".');
}

async function loadEnvFile(path) {
  try {
    const raw = await readFile(resolve(process.cwd(), path), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [rawKey, ...valueParts] = trimmed.split("=");
      const key = stripBom(rawKey);
      const value = valueParts.join("=").replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Optional env file.
  }
}

function stripBom(value) {
  return String(value).replace(/^\uFEFF/, "");
}
