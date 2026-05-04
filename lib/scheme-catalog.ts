import type { SchemeStage } from "@/lib/types";

export type SchemeBand =
  | "early-years"
  | "lower-primary"
  | "middle-primary"
  | "junior"
  | "senior";

export type SchemeSubjectFamily =
  | "mathematics"
  | "english"
  | "kiswahili"
  | "cre"
  | "religion"
  | "integrated-science"
  | "social-studies"
  | "agriculture"
  | "creative-arts"
  | "home-science"
  | "computer-studies"
  | "business-studies"
  | "pre-technical-studies"
  | "life-skills"
  | "fallback";

export const schemeSubjectSuggestions = [
  "Mathematics",
  "English",
  "Kiswahili",
  "C.R.E",
  "I.R.E",
  "H.R.E",
  "Integrated Science",
  "Social Studies",
  "Agriculture",
  "Creative Arts & Sports",
  "Home Science",
  "Computer Studies",
  "Performing Arts",
  "Visual Arts",
  "Music",
  "Business Studies",
  "Pre-Technical Studies",
  "Life Skills",
  "Christian Religious Education"
] as const;

function parseGradeNumber(classLabel: string) {
  const match = classLabel.match(/(\d{1,2})/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function resolveSchemeBand(
  stage: SchemeStage,
  classLabel: string
): SchemeBand {
  if (stage === "pre-primary") {
    return "early-years";
  }

  if (stage === "senior-school") {
    return "senior";
  }

  const grade = parseGradeNumber(classLabel);

  if (!grade) {
    return "junior";
  }

  if (grade <= 3) {
    return "lower-primary";
  }

  if (grade <= 6) {
    return "middle-primary";
  }

  if (grade <= 9) {
    return "junior";
  }

  return "senior";
}

export function getSchemeSubjectFamily(subject: string): SchemeSubjectFamily {
  const normalized = subject.trim().toLowerCase();

  if (/math|mathematics|numeracy/.test(normalized)) {
    return "mathematics";
  }

  if (/english/.test(normalized)) {
    return "english";
  }

  if (/kiswahili/.test(normalized)) {
    return "kiswahili";
  }

  if (
    /\bc\.?r\.?e\b|christian religious education|christian education/.test(
      normalized
    )
  ) {
    return "cre";
  }

  if (
    /\bi\.?r\.?e\b|\bh\.?r\.?e\b|islamic|hindu|religious education/.test(
      normalized
    )
  ) {
    return "religion";
  }

  if (/integrated science|science/.test(normalized)) {
    return "integrated-science";
  }

  if (/social studies/.test(normalized)) {
    return "social-studies";
  }

  if (/agriculture/.test(normalized)) {
    return "agriculture";
  }

  if (
    /creative arts|sports|performing arts|visual arts|music|art/.test(
      normalized
    )
  ) {
    return "creative-arts";
  }

  if (/home science/.test(normalized)) {
    return "home-science";
  }

  if (/computer/.test(normalized)) {
    return "computer-studies";
  }

  if (/business studies/.test(normalized)) {
    return "business-studies";
  }

  if (/pre-technical/.test(normalized)) {
    return "pre-technical-studies";
  }

  if (/life skills/.test(normalized)) {
    return "life-skills";
  }

  return "fallback";
}

function getLowerPrimaryLabel(classLabel: string) {
  return classLabel.replace(/^Grade\s+/i, "Grade ");
}

function getKiswahiliGradeLabel(classLabel: string) {
  return classLabel.replace(/^Grade\s+/i, "Gredi ");
}

function buildJuniorLabel(classLabel: string) {
  return classLabel.replace(/^Grade\s+/i, "Grade ");
}

export function getSuggestedSchemeTextbook(args: {
  stage: SchemeStage;
  classLabel: string;
  subject: string;
}) {
  const family = getSchemeSubjectFamily(args.subject);
  const band = resolveSchemeBand(args.stage, args.classLabel);
  const classLabel = args.classLabel.trim();

  if (args.stage === "pre-primary") {
    switch (family) {
      case "mathematics":
        return `Longhorn Pre-Primary Mathematics Activities ${classLabel}`;
      case "english":
        return `Longhorn Pre-Primary Language Activities ${classLabel}`;
      case "kiswahili":
        return `Longhorn Pre-Primary Kiswahili Activities ${classLabel}`;
      case "creative-arts":
        return `Longhorn Pre-Primary Creative Activities ${classLabel}`;
      default:
        return `Pre-Primary ${args.subject.trim()} Activity Book ${classLabel}`;
    }
  }

  switch (family) {
    case "mathematics":
      return band === "junior" || band === "senior"
        ? `Smart Minds Mathematics Learner's Book ${buildJuniorLabel(classLabel)}`
        : `KLB Top Scholar Mathematics Learner's Book ${getLowerPrimaryLabel(classLabel)}`;
    case "english":
      return `KLB Top Scholar English Learner's Book ${getLowerPrimaryLabel(classLabel)}`;
    case "kiswahili":
      return `KLB Top Scholar Kiswahili Kitabu cha Mwanafunzi ${getKiswahiliGradeLabel(classLabel)}`;
    case "cre":
      return `Longhorn Christian Religious Education Learner's Book ${buildJuniorLabel(classLabel)}`;
    case "religion":
      return `${args.subject.trim()} Learner's Book ${buildJuniorLabel(classLabel)}`;
    case "integrated-science":
      return `MST Integrated Science Learner's Book ${buildJuniorLabel(classLabel)}`;
    case "social-studies":
      return `Moran Social Studies Learner's Book ${buildJuniorLabel(classLabel)}`;
    case "agriculture":
      return `KLB Top Scholar Agriculture Learner's Book ${buildJuniorLabel(classLabel)}`;
    case "creative-arts":
      return `MTP Creative Arts and Sports Learner's Book ${buildJuniorLabel(classLabel)}`;
    case "home-science":
      return `Longhorn Home Science Learner's Book ${buildJuniorLabel(classLabel)}`;
    case "computer-studies":
      return `KLB Top Scholar Computer Studies Learner's Book ${buildJuniorLabel(classLabel)}`;
    case "business-studies":
      return `Spotlight Business Studies Learner's Book ${buildJuniorLabel(classLabel)}`;
    case "pre-technical-studies":
      return `KLB Top Scholar Pre-Technical Studies Learner's Book ${buildJuniorLabel(classLabel)}`;
    case "life-skills":
      return `Life Skills Education Learner's Book ${buildJuniorLabel(classLabel)}`;
    default:
      return `${args.subject.trim()} Learner's Book ${buildJuniorLabel(classLabel)}`;
  }
}

