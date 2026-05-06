export const siteName = "ELimuCore";
export const siteAlternateNames = ["ElimuCore", "ELimu Core"];

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const siteDescription =
  "ELimuCore helps teachers, parents, and learners in Kenya access schemes of work, assessments, revision materials, self-learning junior classes, and Scheme Bot tools in one place.";

export const homePageTitle =
  "Learning Platform for Teachers, Parents & Learners";

export const homePageDescription =
  "ELimuCore gives teachers and parents in Kenya one place for schemes of work, assessments, revision materials, self-learning junior classes, and teacher Scheme Bot tools.";

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
export const siteLogoUrl = `${siteUrl}/favicon.png`;

export const primarySiteLinks = [
  {
    name: "About ELimuCore",
    url: `${siteUrl}/about`
  },
  {
    name: "Pricing",
    url: `${siteUrl}/pricing`
  },
  {
    name: "Support",
    url: `${siteUrl}/support`
  },
  {
    name: "Self-Learning Junior Classes",
    url: `${siteUrl}/classes`
  },
  {
    name: "Scheme Bot",
    url: `${siteUrl}/scheme-bot`
  }
] as const;
