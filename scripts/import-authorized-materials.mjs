import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const manifestArg = process.argv[2];

if (!manifestArg) {
  console.error("Usage: node ./scripts/import-authorized-materials.mjs ./data/materials.json");
  process.exit(1);
}

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. These are required for server-side imports."
  );
  process.exit(1);
}

const manifestPath = resolve(process.cwd(), manifestArg);
const rawFile = await readFile(manifestPath, "utf8");
const manifest = JSON.parse(rawFile);

if (!Array.isArray(manifest.resources)) {
  console.error("The import manifest must contain a top-level 'resources' array.");
  process.exit(1);
}

const supabase = createClient(projectUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const resources = manifest.resources.map((resource) => ({
  slug: resource.slug,
  title: resource.title,
  summary: resource.summary ?? "",
  description: resource.description ?? resource.summary ?? "",
  school_level_slug: resource.school_level_slug,
  category_slug: resource.category_slug,
  subject: resource.subject ?? "General",
  access: resource.access === "premium" ? "premium" : "free",
  format: resource.format ?? "PDF",
  resource_year: resource.resource_year ?? null,
  term: resource.term ?? null,
  featured: Boolean(resource.featured),
  published: resource.published ?? true,
  storage_path: resource.storage_path ?? null,
  source_url: resource.source_url ?? null
}));

const { error } = await supabase
  .from("resources")
  .upsert(resources, { onConflict: "slug" });

if (error) {
  console.error("Supabase import failed:", error.message);
  process.exit(1);
}

console.log(`Upserted ${resources.length} resource records from ${manifestPath}.`);
