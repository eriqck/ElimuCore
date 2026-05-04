const SUBJECT_RULES = [
  { label: "Agriculture", patterns: [/\bagri(?:culture)?\b/i] },
  { label: "Biology", patterns: [/\bbiology\b/i, /\bbio\b/i] },
  { label: "Business Studies", patterns: [/\bbusiness studies\b/i, /\bbust\b/i] },
  { label: "Chemistry", patterns: [/\bchemistry\b/i, /\bchem\b/i] },
  { label: "CRE", patterns: [/\bcre\b/i, /\bchristian religious education\b/i] },
  { label: "English", patterns: [/\benglish\b/i, /\beng\b/i] },
  { label: "Geography", patterns: [/\bgeography\b/i, /\bgeo\b/i] },
  { label: "History", patterns: [/\bhistory\b/i, /\bhist\b/i] },
  { label: "Kiswahili", patterns: [/\bkiswahili\b/i, /\bkis\b/i] },
  { label: "Mathematics", patterns: [/\bmathematics\b/i, /\bmaths?\b/i] },
  { label: "Physics", patterns: [/\bphysics\b/i, /\bphy\b/i] },
  { label: "Computer Studies", patterns: [/\bcomputer studies\b/i, /\bcomputer\b/i] },
  { label: "Life Skills", patterns: [/\blife skills\b/i] }
];

const SECONDARY_SUBJECT_PATTERN =
  /\b(?:agri|bio|biology|bust|business studies|chem|chemistry|cre|english|eng|geo|geography|hist|history|kis|kiswahili|math|maths|mathematics|phy|physics)\b/i;

const PRE_PRIMARY_PATTERN =
  /\bpre[\s-]?primary\b|\bpp\s*[12]\b|\bpp[12]\b|\bplaygroup\b|\bkindergarten\b/i;

const JUNIOR_SCHOOL_PATTERN =
  /\bjunior school\b|\bgrade\s*(7|8|9)\b|\bgrade[-_ ](7|8|9)\b/i;

const PRIMARY_SCHOOL_PATTERN =
  /\bprimary school\b|\blower primary\b|\bgrade\s*([1-6])\b|\bgrade[-_ ]([1-6])\b|\bclass\s*([1-6])\b|\bstandard\s*([1-6])\b/i;

const SECONDARY_LEVEL_PATTERN =
  /\bsecondary school\b|\bsenior school\b|\bkcse\b|\bgrade\s*10\b|\bgrade[-_ ]10\b|\bform\s*(3|4)\b|\bf\s*(3|4)\b/i;

const QUICK_REVISION_PATTERN =
  /\bquick revision series\b|\brevision booklet\b|\brevision booklets\b/i;

const PAPER_CODE_PATTERN =
  /\bpp\s*[123]\b|\bpp[123]\b|\bpaper\s*[123]\b|\bpaper\s*1\s*[&/]\s*2\b|\bpp1[_/\s-]*2\b/i;

function normalizeText(value) {
  return String(value ?? "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/[.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toLaunchLevelSchoolLevel(launchLevel) {
  if (!launchLevel) {
    return null;
  }

  if (launchLevel === "form-3-4" || launchLevel === "grade-10") {
    return "secondary-school";
  }

  if (["grade-7", "grade-8", "grade-9"].includes(launchLevel)) {
    return "junior-school";
  }

  if (/^grade-[1-6]$/.test(launchLevel)) {
    return "primary-school";
  }

  if (launchLevel === "pp1" || launchLevel === "pp2") {
    return "pre-primary";
  }

  return null;
}

function hasSecondarySignals(text) {
  return (
    SECONDARY_LEVEL_PATTERN.test(text) ||
    (QUICK_REVISION_PATTERN.test(text) &&
      (SECONDARY_SUBJECT_PATTERN.test(text) || PAPER_CODE_PATTERN.test(text))) ||
    (PAPER_CODE_PATTERN.test(text) &&
      (SECONDARY_SUBJECT_PATTERN.test(text) || /\bkcse\b/i.test(text)))
  );
}

function hasExplicitPrePrimarySignals(text) {
  if (/\bpre[\s-]?primary\b/i.test(text)) {
    return true;
  }

  if (!PRE_PRIMARY_PATTERN.test(text)) {
    return false;
  }

  return !hasSecondarySignals(text);
}

export function inferResourceSubject(resource) {
  const text = normalizeText(
    [
      resource.title,
      resource.summary,
      resource.description,
      resource.sourcePageTitle
    ].join(" ")
  );

  const match = SUBJECT_RULES.find(({ patterns }) =>
    patterns.some((pattern) => pattern.test(text))
  );

  return match?.label ?? "Mixed Subjects";
}

export function inferResourceSchoolLevel(resource) {
  const text = normalizeText(
    [
      resource.title,
      resource.summary,
      resource.description,
      resource.sourcePageTitle,
      resource.sourceUrl
    ].join(" ")
  );

  if (hasExplicitPrePrimarySignals(text)) {
    return "pre-primary";
  }

  if (JUNIOR_SCHOOL_PATTERN.test(text)) {
    return "junior-school";
  }

  if (PRIMARY_SCHOOL_PATTERN.test(text) && !/\bgrade\s*10\b|\bgrade[-_ ]10\b/i.test(text)) {
    return "primary-school";
  }

  if (SECONDARY_LEVEL_PATTERN.test(text) || hasSecondarySignals(text)) {
    return "secondary-school";
  }

  return toLaunchLevelSchoolLevel(resource.launchLevel) ?? "secondary-school";
}

export function inferResourceCategory(resource) {
  const text = normalizeText(
    [
      resource.title,
      resource.summary,
      resource.description,
      resource.sourcePageTitle
    ].join(" ")
  ).toLowerCase();

  if (
    QUICK_REVISION_PATTERN.test(text) ||
    /\bbooklets with answers\b/.test(text) ||
    /\bassessments?\b/.test(text) ||
    /\bexams?\b/.test(text) ||
    /\bmock\b/.test(text) ||
    /\btests?\b/.test(text)
  ) {
    return "exams";
  }

  if (
    /\bmarking scheme\b/.test(text) ||
    /\bmarking schemes\b/.test(text) ||
    /\bscheme\b/.test(text) ||
    /\bms\b/.test(text) ||
    /\bans(?:wer|wers)?\b/.test(text)
  ) {
    return "marking-schemes";
  }

  if (/\blesson plan\b/.test(text)) {
    return "lesson-plans";
  }

  if (/\bschemes of work\b/.test(text)) {
    return "schemes-of-work";
  }

  if (/\bassignment\b/.test(text)) {
    return "assignments";
  }

  if (/\bsetbook\b|\bset book\b/.test(text)) {
    return "setbooks";
  }

  if (/\bpowerpoint\b|\bpower point\b|\.ppt/.test(text)) {
    return "powerpoint-notes";
  }

  if (/\btopical\b|\btopic\b/.test(text)) {
    return "topical-questions";
  }

  if (
    /\bpast paper\b|\bpastpaper\b/.test(text) ||
    (PAPER_CODE_PATTERN.test(text) && !hasSecondarySignals(text))
  ) {
    return "past-papers";
  }

  if (/\bnote\b/.test(text)) {
    return "notes";
  }

  return "notes";
}

export function inferLaunchLevel(resource) {
  const text = normalizeText(
    [
      resource.title,
      resource.summary,
      resource.description,
      resource.sourcePageTitle,
      resource.sourceUrl
    ].join(" ")
  );

  if (hasExplicitPrePrimarySignals(text)) {
    const ppMatch = text.match(/\bpp\s*([12])\b|\bpp([12])\b/i);
    return ppMatch ? `pp${ppMatch[1] || ppMatch[2]}` : "pp1";
  }

  const juniorMatch = text.match(/\bgrade\s*(7|8|9)\b|\bgrade[-_ ](7|8|9)\b/i);
  if (juniorMatch) {
    return `grade-${juniorMatch[1] || juniorMatch[2]}`;
  }

  const primaryMatch = text.match(
    /\bgrade\s*([1-6])\b|\bgrade[-_ ]([1-6])\b|\bclass\s*([1-6])\b|\bstandard\s*([1-6])\b/i
  );
  if (primaryMatch) {
    return `grade-${primaryMatch[1] || primaryMatch[2] || primaryMatch[3] || primaryMatch[4]}`;
  }

  if (/\bgrade\s*10\b|\bgrade[-_ ]10\b/i.test(text)) {
    return "grade-10";
  }

  if (hasSecondarySignals(text) || /\bform\s*(3|4)\b|\bf\s*(3|4)\b/i.test(text)) {
    return "form-3-4";
  }

  return null;
}

export function inferImportedResourceMetadata(resource) {
  return {
    school_level_slug: inferResourceSchoolLevel(resource),
    category_slug: inferResourceCategory(resource),
    subject: inferResourceSubject(resource),
    launch_level: inferLaunchLevel(resource)
  };
}

export function fileKindForCategorySlug(categorySlug) {
  if (categorySlug === "past-papers") {
    return "paper";
  }

  if (categorySlug === "marking-schemes") {
    return "marking-scheme";
  }

  if (categorySlug === "notes" || categorySlug === "powerpoint-notes") {
    return "notes";
  }

  return "download";
}

export function extractSourcePageTitleFromText(...values) {
  const text = values
    .map((value) => String(value ?? ""))
    .find((value) => value.includes("Authorized migration from")) ??
    values
      .map((value) => String(value ?? ""))
      .find((value) => value.includes("Material migrated from KCSE Online page:")) ??
    "";

  const migrationMatch = text.match(/Authorized migration from\s+(.+?)\.?$/i);
  if (migrationMatch?.[1]) {
    return migrationMatch[1].trim();
  }

  const pageMatch = text.match(
    /Material migrated from KCSE Online page:\s+(.+?)\.?$/i
  );

  return pageMatch?.[1]?.trim() ?? "";
}
