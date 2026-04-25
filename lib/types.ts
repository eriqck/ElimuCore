export type QuickLink = {
  title: string;
  desc: string;
  badge: string;
  href: string;
};

export type SchoolLevelItem = {
  label: string;
  href: string;
};

export type SchoolLevel = {
  slug: string;
  title: string;
  subtitle: string;
  items: SchoolLevelItem[];
};

export type CategoryFilter = {
  slug: string;
  name: string;
};

export type Resource = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  level: string;
  levelSlug: string;
  category: string;
  categorySlug: string;
  subject: string;
  access: "Free" | "Premium";
  format: string;
  year: number | null;
  term: string | null;
  featured: boolean;
  storagePath: string | null;
  sourceUrl: string | null;
};

export type FeaturedResource = {
  slug: string;
  title: string;
  meta: string;
  summary: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type HomePageData = {
  quickLinks: QuickLink[];
  schoolLevels: SchoolLevel[];
  categories: string[];
  featuredResources: FeaturedResource[];
  stats: Stat[];
};
