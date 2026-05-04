export const siteName = "ELimuCore";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const siteDescription =
  "ELimuCore helps teachers and parents access CBE and KCSE learning materials, self-learning junior classes, revision resources, and Scheme Bot teacher tools in one place.";

export const homePageTitle =
  "CBE & KCSE Resources, Junior Self-Learning and Scheme Bot";

export const homePageDescription =
  "ELimuCore gives teachers and parents in Kenya one place for CBE and KCSE learning materials, self-learning junior classes, revision support, and teacher Scheme Bot tools.";

export const siteKeywords = [
  "ELimuCore",
  "KCSE",
  "CBE",
  "teachers",
  "parents",
  "learning materials",
  "lesson plans",
  "revision resources",
  "junior classes",
  "schemes of work",
  "Kenya education"
];

export const siteOgImageUrl = `${siteUrl}/opengraph-image`;
