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

export type LearningAccess = "free" | "premium";

export type LearningLessonType = "guided" | "practice" | "quiz";

export type LearningCard = {
  id: string;
  title: string;
  body: string;
  visual?: string;
};

export type LearningQuestion = {
  id: string;
  prompt: string;
  visual?: string;
  choices: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
};

export type LearningLesson = {
  slug: string;
  topicSlug: string;
  classSlug: string;
  title: string;
  summary: string;
  description: string;
  lessonType: LearningLessonType;
  access: LearningAccess;
  estimatedMinutes: number;
  sortOrder: number;
  objectives: string[];
  learningCards: LearningCard[];
  questions: LearningQuestion[];
  passingScore: number;
};

export type LearningTopic = {
  slug: string;
  classSlug: string;
  title: string;
  summary: string;
  description: string;
  access: LearningAccess;
  sortOrder: number;
  lessons: LearningLesson[];
};

export type LearningClass = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  audience: string;
  statusLabel: string;
  available: boolean;
  sortOrder: number;
  topics: LearningTopic[];
};

export type LearningLessonProgress = {
  lessonSlug: string;
  classSlug: string;
  topicSlug: string;
  completed: boolean;
  score: number | null;
  questionCount: number;
  completedAt: string | null;
  lastActivityAt: string | null;
};

export type LearningTopicProgressSummary = {
  completedLessons: number;
  totalLessons: number;
  percent: number;
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

export type ResourceLevelBrowseCard = {
  slug: string;
  title: string;
  subtitle: string;
  count: number;
  levelSlugs: string[];
  categorySlug?: string | null;
};

export type SchemeRequestStatus =
  | "pending_payment"
  | "generating"
  | "completed"
  | "failed";

export type SchemeAccessMode = "premium" | "single_purchase";

export type SchemeStage = "pre-primary" | "junior-school" | "senior-school";

export type SchemeLanguage = "en" | "sw";

export type TeacherDocumentKind =
  | "scheme"
  | "lesson-plan"
  | "assessment"
  | "marking-scheme"
  | "lesson-notes";

export type SchemeDocumentRow = {
  weekLabel: string;
  lessonLabel: string;
  strand: string;
  subStrand: string;
  outcomes: string[];
  experiences: string[];
  keyInquiryQuestions: string[];
  resources: string[];
  assessment: string[];
  reflection: string;
};

export type SchemeDocumentContent = {
  title: string;
  subtitle: string;
  language: SchemeLanguage;
  schoolName: string;
  teacherName: string;
  classLabel: string;
  subject: string;
  term: string;
  year: number;
  rows: SchemeDocumentRow[];
};

export type LessonPlanDocumentLesson = {
  lessonLabel: string;
  duration: string;
  focus: string;
  objectives: string[];
  materials: string[];
  introduction: string[];
  activities: string[];
  assessment: string[];
  homework: string[];
  differentiation: string[];
};

export type LessonPlanDocumentContent = {
  title: string;
  subtitle: string;
  language: SchemeLanguage;
  schoolName: string;
  teacherName: string;
  classLabel: string;
  subject: string;
  term: string;
  year: number;
  lessons: LessonPlanDocumentLesson[];
};

export type AssessmentQuestionType =
  | "short-answer"
  | "structured"
  | "application";

export type AssessmentDocumentItem = {
  numberLabel: string;
  prompt: string;
  expectedAnswer: string;
  marks: number;
  type: AssessmentQuestionType;
};

export type AssessmentDocumentSection = {
  title: string;
  instructions: string;
  items: AssessmentDocumentItem[];
};

export type AssessmentDocumentContent = {
  title: string;
  subtitle: string;
  language: SchemeLanguage;
  schoolName: string;
  teacherName: string;
  classLabel: string;
  subject: string;
  term: string;
  year: number;
  durationMinutes: number;
  totalMarks: number;
  instructions: string[];
  sections: AssessmentDocumentSection[];
};

export type MarkingSchemeDocumentItem = {
  questionLabel: string;
  prompt: string;
  marks: number;
  answerPoints: string[];
};

export type MarkingSchemeDocumentSection = {
  title: string;
  guidance: string;
  items: MarkingSchemeDocumentItem[];
};

export type MarkingSchemeDocumentContent = {
  title: string;
  subtitle: string;
  language: SchemeLanguage;
  schoolName: string;
  teacherName: string;
  classLabel: string;
  subject: string;
  term: string;
  year: number;
  totalMarks: number;
  sections: MarkingSchemeDocumentSection[];
};

export type LessonNotesDocumentSection = {
  sectionLabel: string;
  focus: string;
  objectives: string[];
  explanation: string[];
  examples: string[];
  learnerTasks: string[];
  homeSupport: string[];
};

export type LessonNotesDocumentContent = {
  title: string;
  subtitle: string;
  language: SchemeLanguage;
  schoolName: string;
  teacherName: string;
  classLabel: string;
  subject: string;
  term: string;
  year: number;
  sections: LessonNotesDocumentSection[];
};

export type SchemeRequest = {
  id: string;
  userId: string;
  status: SchemeRequestStatus;
  accessMode: SchemeAccessMode;
  outputKind: TeacherDocumentKind;
  sourceRequestId: string | null;
  stage: SchemeStage;
  classLabel: string;
  subject: string;
  term: string;
  year: number;
  schoolName: string;
  teacherName: string;
  textbook: string;
  notes: string;
  weeksInTerm: number;
  lessonsPerWeek: number;
  language: SchemeLanguage;
  generatedTitle: string | null;
  generatedOverview: string;
  generatedContent:
    | SchemeDocumentContent
    | LessonPlanDocumentContent
    | AssessmentDocumentContent
    | MarkingSchemeDocumentContent
    | LessonNotesDocumentContent
    | null;
  storageBucket: string | null;
  storagePath: string | null;
  errorMessage: string;
  paidAt: string | null;
  completedAt: string | null;
  createdAt: string;
};
