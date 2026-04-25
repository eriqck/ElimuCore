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

export type SchoolLevelFilter = {
  slug: string;
  title: string;
  subtitle?: string;
};

export type CategoryFilter = {
  slug: string;
  name: string;
};

export type ResourceFileKind =
  | "download"
  | "paper"
  | "marking-scheme"
  | "notes"
  | "zip"
  | "link";

export type ResourceFile = {
  id: string;
  label: string;
  fileKind: ResourceFileKind;
  bucketPath: string;
  mimeType: string | null;
  fileSizeBytes: number | null;
  fileSizeLabel: string | null;
  createdAt: string | null;
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

export type ResourceDetail = Resource & {
  files: ResourceFile[];
};

export type MembershipPlan = {
  slug: string;
  name: string;
  durationMonths: number;
  priceKes: number;
  description: string;
  active: boolean;
  sortOrder: number;
};

export type MembershipStatus =
  | "pending"
  | "active"
  | "expired"
  | "cancelled";

export type UserMembership = {
  id: string;
  planSlug: string;
  status: MembershipStatus;
  startsAt: string | null;
  expiresAt: string | null;
  notes: string;
  plan: MembershipPlan | null;
  isActive: boolean;
};

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  role: "member" | "admin";
};

export type MemberContext = {
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
  memberships: UserMembership[];
  activeMembership: UserMembership | null;
  plans: MembershipPlan[];
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
  categories: CategoryFilter[];
  featuredResources: FeaturedResource[];
  stats: Stat[];
};

export type LibraryFilters = {
  categories: CategoryFilter[];
  levels: SchoolLevelFilter[];
};
