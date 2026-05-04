import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import process from "node:process";
import { inferLaunchLevel } from "./lib/resource-classification.mjs";

const sourcePath = resolve(
  process.cwd(),
  process.argv[2] ?? "data/kcseonline-authorized-materials.json"
);
const outputPath = resolve(
  process.cwd(),
  process.argv[3] ?? "data/kcseonline-launch-materials.json"
);

const sourceManifest = JSON.parse(await readFile(sourcePath, "utf8"));

if (!Array.isArray(sourceManifest.resources)) {
  console.error("Source manifest must contain a resources array.");
  process.exit(1);
}

const included = [];
const skipped = [];

for (const resource of sourceManifest.resources) {
  const decision = classifyLaunchLevel(resource);

  if (decision.include) {
    included.push({
      ...resource,
      launch_level: decision.level,
      launch_reason: decision.reason
    });
  } else {
    skipped.push({
      slug: resource.slug,
      title: resource.title,
      source_page_title: resource.source_page_title,
      reason: decision.reason
    });
  }
}

const launchManifest = {
  ...sourceManifest,
  generated_at: new Date().toISOString(),
  launch_scope:
    "PP1, PP2, Grade 1-10, and Form 3-4 materials across all subjects.",
  crawl: {
    ...(sourceManifest.crawl ?? {}),
    resources_found: included.length,
    original_resources_found: sourceManifest.resources.length,
    skipped_for_later: skipped.length,
    downloaded: false
  },
  resources: included,
  skipped_for_later: skipped
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(launchManifest, null, 2)}\n`);

console.log(`Launch resources: ${included.length}`);
console.log(`Skipped for later: ${skipped.length}`);
console.log(`Manifest written to ${outputPath}`);

function classifyLaunchLevel(resource) {
  const inferredLevel = inferLaunchLevel({
    title: resource.title,
    summary: resource.summary,
    description: resource.description,
    sourcePageTitle: resource.source_page_title,
    sourceUrl: resource.source_url
  });

  if (inferredLevel) {
    return {
      include: true,
      level: inferredLevel,
      reason: inferredLevel.replaceAll("-", " ")
    };
  }

  const text = normalizeText(
    [
      resource.title,
      resource.summary,
      resource.description,
      resource.source_page_title,
      resource.source_url
    ].join(" ")
  );

  const formExcludedMatch = /\bform\s*(1|2)\b|\bf\s*(1|2)\b/.exec(text);
  if (formExcludedMatch) {
    return {
      include: false,
      reason: "Form 1/2 saved for later"
    };
  }

  return {
    include: false,
    reason: "Outside launch levels"
  };
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
