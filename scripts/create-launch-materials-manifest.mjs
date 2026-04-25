import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import process from "node:process";

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
  const text = normalizeText(
    [
      resource.title,
      resource.summary,
      resource.description,
      resource.source_page_title,
      resource.source_url
    ].join(" ")
  );

  const ppMatch = text.match(/\bpp\s*([12])\b|\bpre[-\s]?primary\s*([12])\b/);
  if (ppMatch) {
    const pp = ppMatch[1] || ppMatch[2];
    return {
      include: true,
      level: `pp${pp}`,
      reason: `PP${pp}`
    };
  }

  const gradeMatch = text.match(/\bgrade\s*([1-9]|10)\b|\bgrade[-_]?([1-9]|10)\b/);
  if (gradeMatch) {
    const grade = gradeMatch[1] || gradeMatch[2];
    return {
      include: true,
      level: `grade-${grade}`,
      reason: `Grade ${grade}`
    };
  }

  const grediMatch = text.match(/\bgredi\s*(ya\s*)?([1-9]|10)\b/);
  if (grediMatch) {
    return {
      include: true,
      level: `grade-${grediMatch[2]}`,
      reason: `Gredi ${grediMatch[2]}`
    };
  }

  const classMatch = text.match(/\b(class|std|standard)\s*([1-9]|10)\b/);
  if (classMatch) {
    const grade = classMatch[2];
    return {
      include: true,
      level: `grade-${grade}`,
      reason: `${classMatch[1]} ${grade}`
    };
  }

  const formTargetMatch =
    /\bform\s*(3|4)\b|\bf\s*(3|4)\b|\bform\s*3\s*[-/ ]\s*4\b|\bform\s*34\b/.exec(
      text
    );
  if (formTargetMatch) {
    return {
      include: true,
      level: "form-3-4",
      reason: "Form 3/4"
    };
  }

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
