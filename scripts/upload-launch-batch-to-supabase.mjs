import { readFile, writeFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const args = parseArgs(process.argv.slice(2));
const manifestPath = resolve(
  process.cwd(),
  args.manifest ?? "data/kcseonline-launch-batch-1.json"
);
const reportPath = resolve(
  process.cwd(),
  args.report ?? "data/kcseonline-launch-batch-1-import-report.json"
);
const bucketName = args.bucket ?? "resource-files";
const uploadPrefix = args.prefix ?? "kcseonline/launch-batch-1";
const limit = args.limit ? Number.parseInt(args.limit, 10) : Infinity;
const offset = args.offset ? Number.parseInt(args.offset, 10) : 0;

await loadEnvFile(".env.local");
await loadEnvFile(".env");

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local before uploading."
  );
  process.exit(1);
}

const manifest = JSON.parse(stripBom(await readFile(manifestPath, "utf8")));

if (!Array.isArray(manifest.resources)) {
  console.error("Manifest must contain a resources array.");
  process.exit(1);
}

const selectedResources = manifest.resources.slice(
  offset,
  Number.isFinite(limit) ? offset + limit : undefined
);

const supabase = createClient(projectUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

await ensureContentLookups();
await ensureStorageBucket();

const report = {
  manifest: manifestPath,
  started_at: new Date().toISOString(),
  offset,
  limit: Number.isFinite(limit) ? limit : null,
  attempted: selectedResources.length,
  uploaded: 0,
  failed: 0,
  failures: []
};

for (const [index, resource] of selectedResources.entries()) {
  try {
    if (!resource.storage_path) {
      throw new Error("Resource has no local storage_path.");
    }

    const localPath = resolve(process.cwd(), resource.storage_path);
    const fileName = basename(localPath);
    const extension = extname(fileName) || extensionForFormat(resource.format);
    const bucketPath = [
      uploadPrefix,
      resource.launch_level ?? resource.school_level_slug,
      resource.category_slug,
      `${sanitizePathSegment(resource.slug)}${extension}`
    ].join("/");
    const fileBuffer = await readFile(localPath);
    const contentType = mimeTypeForExtension(extension);

    const { error: uploadError } = await withSupabaseRetry(
      `Storage upload for ${resource.slug}`,
      () =>
        supabase.storage.from(bucketName).upload(bucketPath, fileBuffer, {
          cacheControl: "31536000",
          contentType,
          upsert: true
        })
    );

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const resourceRow = toResourceRow(resource, bucketPath);
    const { data: upsertedResource, error: resourceError } =
      await withSupabaseRetry(`Resource upsert for ${resource.slug}`, () =>
        supabase
          .from("resources")
          .upsert(resourceRow, { onConflict: "slug" })
          .select("id")
          .single()
      );

    if (resourceError) {
      throw new Error(`Resource upsert failed: ${resourceError.message}`);
    }

    const { error: deleteFileError } = await withSupabaseRetry(
      `Existing file cleanup for ${resource.slug}`,
      () =>
        supabase
          .from("resource_files")
          .delete()
          .eq("resource_id", upsertedResource.id)
    );

    if (deleteFileError) {
      throw new Error(`Existing file cleanup failed: ${deleteFileError.message}`);
    }

    const { error: fileError } = await withSupabaseRetry(
      `Resource file insert for ${resource.slug}`,
      () =>
        supabase.from("resource_files").insert({
          resource_id: upsertedResource.id,
          label: resource.title,
          file_kind: fileKindForCategory(resource.category_slug),
          bucket_path: bucketPath,
          mime_type: contentType,
          file_size_bytes: fileBuffer.byteLength,
          is_public: false
        })
    );

    if (fileError) {
      throw new Error(`Resource file insert failed: ${fileError.message}`);
    }

    report.uploaded += 1;
    console.log(
      `Uploaded ${index + 1}/${selectedResources.length}: ${resource.title}`
    );
  } catch (error) {
    report.failed += 1;
    report.failures.push({
      slug: resource.slug,
      title: resource.title,
      error: error.message
    });
    console.warn(`Failed ${resource.title}: ${error.message}`);
  }
}

report.finished_at = new Date().toISOString();
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(
  `Finished Supabase upload. Uploaded ${report.uploaded}; failed ${report.failed}.`
);
console.log(`Report written to ${reportPath}.`);

async function ensureContentLookups() {
  const schoolLevels = [
    {
      slug: "secondary-school",
      title: "Secondary School",
      subtitle: "Focused resources for Form 3, Form 4, and KCSE preparation",
      sort_order: 1
    },
    {
      slug: "junior-school",
      title: "Junior School",
      subtitle: "Structured CBE support for Grade 7-9 learners",
      sort_order: 2
    },
    {
      slug: "primary-school",
      title: "Primary School",
      subtitle: "Organized CBE content for Grades 1-6",
      sort_order: 3
    },
    {
      slug: "pre-primary",
      title: "Pre-Primary",
      subtitle: "Early learning resources for PP1 and PP2",
      sort_order: 4
    }
  ];

  const categories = [
    { slug: "past-papers", name: "Past Papers", sort_order: 1 },
    { slug: "notes", name: "Notes", sort_order: 2 },
    { slug: "topical-questions", name: "Topical Questions", sort_order: 3 },
    { slug: "schemes-of-work", name: "Schemes of Work", sort_order: 4 },
    { slug: "lesson-plans", name: "Lesson Plans", sort_order: 5 },
    { slug: "assignments", name: "Assignments", sort_order: 6 },
    { slug: "setbooks", name: "Setbooks", sort_order: 7 },
    { slug: "powerpoint-notes", name: "PowerPoint Notes", sort_order: 8 },
    { slug: "exams", name: "Exams", sort_order: 9 },
    { slug: "marking-schemes", name: "Marking Schemes", sort_order: 10 }
  ];

  const { error: levelsError } = await withSupabaseRetry(
    "School level setup",
    () =>
      supabase.from("school_levels").upsert(schoolLevels, {
        onConflict: "slug"
      })
  );

  if (levelsError) {
    throw new Error(`School level setup failed: ${levelsError.message}`);
  }

  const { error: categoriesError } = await withSupabaseRetry(
    "Category setup",
    () =>
      supabase.from("resource_categories").upsert(categories, {
        onConflict: "slug"
      })
  );

  if (categoriesError) {
    throw new Error(`Category setup failed: ${categoriesError.message}`);
  }
}

async function ensureStorageBucket() {
  const { error } = await withSupabaseRetry("Storage bucket setup", () =>
    supabase.storage.createBucket(bucketName, {
      public: false
    })
  );

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Bucket setup failed: ${error.message}`);
  }
}

function toResourceRow(resource, bucketPath) {
  return {
    slug: resource.slug,
    title: cleanText(resource.title),
    summary:
      cleanText(resource.summary) ||
      `Member-only ${resource.category_slug.replaceAll("-", " ")} resource.`,
    description:
      cleanText(resource.description) ||
      `Imported launch resource from KCSE Online.`,
    school_level_slug: resource.school_level_slug,
    category_slug: resource.category_slug,
    subject: cleanText(resource.subject) || "Mixed Subjects",
    access: "premium",
    format: cleanText(resource.format) || "PDF",
    resource_year: resource.resource_year ?? null,
    term: resource.term ?? null,
    featured: Boolean(resource.featured),
    published: true,
    storage_path: bucketPath,
    source_url: resource.source_url ?? null
  };
}

function fileKindForCategory(categorySlug) {
  if (categorySlug === "past-papers") {
    return "paper";
  }
  if (categorySlug === "marking-schemes") {
    return "marking-scheme";
  }
  if (categorySlug === "notes" || categorySlug === "powerpoint-notes") {
    return "notes";
  }
  if (categorySlug === "exams") {
    return "download";
  }
  return "download";
}

function mimeTypeForExtension(extension) {
  const lower = extension.toLowerCase();
  if (lower === ".pdf") {
    return "application/pdf";
  }
  if (lower === ".doc") {
    return "application/msword";
  }
  if (lower === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower === ".ppt") {
    return "application/vnd.ms-powerpoint";
  }
  if (lower === ".pptx") {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }
  if (lower === ".xls") {
    return "application/vnd.ms-excel";
  }
  if (lower === ".xlsx") {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (lower === ".zip") {
    return "application/zip";
  }
  return "application/octet-stream";
}

function extensionForFormat(format) {
  const lower = String(format ?? "").toLowerCase();
  if (lower.includes("doc")) {
    return ".docx";
  }
  if (lower.includes("powerpoint") || lower.includes("ppt")) {
    return ".pptx";
  }
  if (lower.includes("spreadsheet")) {
    return ".xlsx";
  }
  if (lower.includes("zip")) {
    return ".zip";
  }
  return ".pdf";
}

function sanitizePathSegment(value) {
  return String(value ?? "resource")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
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

function parseArgs(rawArgs) {
  return rawArgs.reduce((acc, arg) => {
    if (!arg.startsWith("--")) {
      return acc;
    }

    const [key, value] = arg.slice(2).split("=");
    acc[key] = value ?? true;
    return acc;
  }, {});
}

function stripBom(value) {
  return String(value).replace(/^\uFEFF/, "");
}

async function withSupabaseRetry(label, operation, attempts = 3) {
  let lastResult;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await operation();
      lastResult = result;

      if (!result?.error || !isRetryableSupabaseError(result.error)) {
        return result;
      }

      if (attempt === attempts) {
        return result;
      }

      console.warn(
        `${label} hit a temporary network error. Retrying ${attempt + 1}/${attempts}...`
      );
    } catch (error) {
      if (!isRetryableSupabaseError(error) || attempt === attempts) {
        throw error;
      }

      lastResult = { error };
      console.warn(
        `${label} hit a temporary network error. Retrying ${attempt + 1}/${attempts}...`
      );
    }

    await wait(attempt * 1500);
  }

  return lastResult;
}

function isRetryableSupabaseError(error) {
  const message = String(error?.message ?? error).toLowerCase();
  return [
    "fetch failed",
    "network",
    "econnreset",
    "etimedout",
    "socket",
    "terminated",
    "timeout"
  ].some((snippet) => message.includes(snippet));
}

function wait(ms) {
  return new Promise((resolveWait) => {
    setTimeout(resolveWait, ms);
  });
}
