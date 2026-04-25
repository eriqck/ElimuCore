import type {
  CategoryFilter,
  FeaturedResource,
  HomePageData,
  QuickLink,
  Resource,
  SchoolLevel,
  Stat
} from "@/lib/types";

export const fallbackQuickLinks: QuickLink[] = [
  {
    title: "Teacher Lesson Plans",
    desc: "Ready-to-use lesson plans, schemes, and classroom guidance.",
    badge: "Teacher Pick",
    href: "/resources?category=lesson-plans"
  },
  {
    title: "Parent Revision Packs",
    desc: "Past papers, guided practice, and home-learning support.",
    badge: "Family Favorite",
    href: "/resources?category=past-papers"
  },
  {
    title: "CBE Assessment Tools",
    desc: "Assessment packs and progress checks from primary to junior school.",
    badge: "Updated",
    href: "/resources?category=exams"
  },
  {
    title: "KCSE Exam Prep",
    desc: "Revision papers, marking schemes, and exam support for secondary school.",
    badge: "Exam Focus",
    href: "/resources?level=secondary-school"
  }
];

export const fallbackSchoolLevels: SchoolLevel[] = [
  {
    slug: "secondary-school",
    title: "Secondary School",
    subtitle: "Exam prep and planning support for teachers and families",
    items: [
      { label: "Form 3 Resources", href: "/resources?level=secondary-school&q=Form 3" },
      { label: "Form 4 Revision", href: "/resources?level=secondary-school&q=Form 4" },
      { label: "KCSE Past Papers", href: "/resources?category=past-papers&level=secondary-school" },
      { label: "Marking Schemes", href: "/resources?category=marking-schemes&level=secondary-school" }
    ]
  },
  {
    slug: "junior-school",
    title: "Junior School",
    subtitle: "CBE planning and revision support for Grade 7-9",
    items: [
      { label: "Grade 7 Notes", href: "/resources?level=junior-school&q=Grade 7" },
      { label: "Grade 8 Exams", href: "/resources?level=junior-school&q=Grade 8 exams" },
      { label: "Grade 9 Assessment", href: "/resources?level=junior-school&q=Grade 9" },
      { label: "Schemes of Work", href: "/resources?level=junior-school&category=schemes-of-work" },
      { label: "Lesson Plans", href: "/resources?level=junior-school&category=lesson-plans" },
      { label: "Topical Questions", href: "/resources?level=junior-school&category=topical-questions" }
    ]
  },
  {
    slug: "primary-school",
    title: "Primary School",
    subtitle: "Homework support, planning tools, and assessments for Grades 1-6",
    items: [
      { label: "Grade 1-3 Resources", href: "/resources?level=primary-school&q=Grade" },
      { label: "Grade 4-6 Notes", href: "/resources?level=primary-school&category=notes" },
      { label: "CBE Exams", href: "/resources?level=primary-school&category=exams" },
      { label: "Assignments", href: "/resources?level=primary-school&category=assignments" },
      { label: "Class Notes", href: "/resources?level=primary-school&q=Class Notes" },
      { label: "Revision Papers", href: "/resources?level=primary-school&category=past-papers" }
    ]
  },
  {
    slug: "pre-primary",
    title: "Pre-Primary",
    subtitle: "Early learning materials for teachers, caregivers, and parents",
    items: [
      { label: "Approved Syllabus", href: "/resources?level=pre-primary&q=syllabus" },
      { label: "Schemes of Work", href: "/resources?level=pre-primary&category=schemes-of-work" },
      { label: "Exams and Answers", href: "/resources?level=pre-primary&category=exams" },
      { label: "CBE Design Materials", href: "/resources?level=pre-primary&q=design" },
      { label: "Teacher Notes", href: "/resources?level=pre-primary&category=notes" },
      { label: "Class Activities", href: "/resources?level=pre-primary&q=activities" }
    ]
  }
];

export const fallbackCategoryFilters: CategoryFilter[] = [
  { slug: "past-papers", name: "Past Papers" },
  { slug: "notes", name: "Notes" },
  { slug: "topical-questions", name: "Topical Questions" },
  { slug: "schemes-of-work", name: "Schemes of Work" },
  { slug: "lesson-plans", name: "Lesson Plans" },
  { slug: "assignments", name: "Assignments" },
  { slug: "setbooks", name: "Setbooks" },
  { slug: "powerpoint-notes", name: "PowerPoint Notes" },
  { slug: "exams", name: "Exams" },
  { slug: "marking-schemes", name: "Marking Schemes" }
];

export const fallbackResources: Resource[] = [
  {
    slug: "2025-kcse-prediction-papers",
    title: "2025 KCSE Prediction Papers",
    summary:
      "A curated prediction pack for Form 4 candidates preparing for KCSE.",
    description:
      "Use this pack as a premium revision collection for Form 4 candidates. It works well as a featured resource and can later point to a Supabase Storage download bundle.",
    level: "Secondary School",
    levelSlug: "secondary-school",
    category: "Past Papers",
    categorySlug: "past-papers",
    subject: "All Subjects",
    access: "Premium",
    format: "PDF bundle",
    year: 2025,
    term: "Term 3",
    featured: true,
    storagePath: null,
    sourceUrl: null
  },
  {
    slug: "grade-8-cbe-assessment-pack",
    title: "Grade 8 CBE Assessment Pack",
    summary:
      "Assessment-ready resources for Grade 8 teachers and learners across core subjects.",
    description:
      "A strong starter item for your junior school library, ideal for organizing assessment packs by subject, term, and year.",
    level: "Junior School",
    levelSlug: "junior-school",
    category: "Exams",
    categorySlug: "exams",
    subject: "Mixed Subjects",
    access: "Premium",
    format: "ZIP archive",
    year: 2025,
    term: "Term 2",
    featured: true,
    storagePath: null,
    sourceUrl: null
  },
  {
    slug: "form-3-holiday-assignments",
    title: "Form 3 Holiday Assignments",
    summary:
      "Holiday assignments for multiple subjects with a clean structure for digital downloads.",
    description:
      "This record demonstrates how to manage recurring term-based materials inside Supabase with searchable metadata.",
    level: "Secondary School",
    levelSlug: "secondary-school",
    category: "Assignments",
    categorySlug: "assignments",
    subject: "All Subjects",
    access: "Premium",
    format: "PDF bundle",
    year: 2025,
    term: "Holiday",
    featured: true,
    storagePath: null,
    sourceUrl: null
  },
  {
    slug: "pp1-pp2-exams-with-answers",
    title: "PP1 and PP2 Exams with Answers",
    summary:
      "Downloadable pre-primary assessments with teacher-friendly answer guides.",
    description:
      "A pre-primary starter record that shows how to separate level, category, and file storage for early years materials.",
    level: "Pre-Primary",
    levelSlug: "pre-primary",
    category: "Exams",
    categorySlug: "exams",
    subject: "Mixed Subjects",
    access: "Premium",
    format: "PDF pack",
    year: 2025,
    term: "Term 1",
    featured: true,
    storagePath: null,
    sourceUrl: null
  },
  {
    slug: "mathematics-kcse-past-papers",
    title: "Mathematics KCSE Past Papers",
    summary:
      "A searchable mathematics archive for KCSE practice by year and paper type.",
    description:
      "Use this as a resource detail template for subject-specific paper collections with future marking-scheme attachments.",
    level: "Secondary School",
    levelSlug: "secondary-school",
    category: "Past Papers",
    categorySlug: "past-papers",
    subject: "Mathematics",
    access: "Premium",
    format: "PDF archive",
    year: 2024,
    term: null,
    featured: false,
    storagePath: null,
    sourceUrl: null
  },
  {
    slug: "grade-7-topical-questions",
    title: "Grade 7 Topical Questions",
    summary:
      "Topic-by-topic CBE practice questions designed for junior school revision.",
    description:
      "A useful category example for organizing revision content outside standard past papers and exams.",
    level: "Junior School",
    levelSlug: "junior-school",
    category: "Topical Questions",
    categorySlug: "topical-questions",
    subject: "Integrated Science",
    access: "Premium",
    format: "PDF notes",
    year: 2025,
    term: null,
    featured: false,
    storagePath: null,
    sourceUrl: null
  },
  {
    slug: "grade-5-lesson-plans",
    title: "Grade 5 Lesson Plans",
    summary:
      "Teacher-ready lesson plans for CBE classrooms with simple publishing metadata.",
    description:
      "This example demonstrates how teacher materials can sit alongside student revision content inside one shared catalog.",
    level: "Primary School",
    levelSlug: "primary-school",
    category: "Lesson Plans",
    categorySlug: "lesson-plans",
    subject: "Mixed Subjects",
    access: "Premium",
    format: "DOCX pack",
    year: 2025,
    term: "Term 2",
    featured: false,
    storagePath: null,
    sourceUrl: null
  },
  {
    slug: "setbooks-study-guides",
    title: "Setbooks Study Guides",
    summary:
      "Structured literature and language setbook guides for independent revision.",
    description:
      "A category-focused resource group that works well for premium or mixed-access educational libraries.",
    level: "Secondary School",
    levelSlug: "secondary-school",
    category: "Setbooks",
    categorySlug: "setbooks",
    subject: "English and Kiswahili",
    access: "Premium",
    format: "PDF guide",
    year: 2025,
    term: null,
    featured: false,
    storagePath: null,
    sourceUrl: null
  }
];

export const fallbackStats: Stat[] = [
  { value: "10K+", label: "Unlimited member resources" },
  { value: "3", label: "Flexible membership plans" },
  { value: "4", label: "School stages covered" },
  { value: "0", label: "Extra download charges" }
];

export const fallbackFeaturedResources: FeaturedResource[] = fallbackResources
  .filter((resource) => resource.featured)
  .slice(0, 4)
  .map((resource) => ({
    slug: resource.slug,
    title: resource.title,
    meta: `${resource.level} | Member access`,
    summary: resource.summary
  }));

export const fallbackHomePageData: HomePageData = {
  quickLinks: fallbackQuickLinks,
  schoolLevels: fallbackSchoolLevels,
  categories: fallbackCategoryFilters.slice(0, 8).map((item) => item.name),
  featuredResources: fallbackFeaturedResources,
  stats: fallbackStats
};
