import "server-only";
import OpenAI from "openai";
import { getOpenAiApiKey, getOpenAiSchemeModel } from "@/lib/supabase/env";
import type {
  SchemeDocumentContent,
  SchemeDocumentRow,
  SchemeLanguage,
  SchemeStage
} from "@/lib/types";

export type SchemeGenerationInput = {
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
};

type RawSchemeResponse = {
  subtitle: string;
  rows: Array<{
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
  }>;
};

let openAiClient: OpenAI | null = null;

function getClient() {
  if (openAiClient) {
    return openAiClient;
  }

  openAiClient = new OpenAI({
    apiKey: getOpenAiApiKey()
  });

  return openAiClient;
}

function buildTitle(input: SchemeGenerationInput) {
  return `${input.year} ${input.classLabel.toUpperCase()} ${input.subject.toUpperCase()} SCHEMES OF WORK TERM ${input.term}`;
}

function buildEnglishPrompt(input: SchemeGenerationInput) {
  const rowCount = input.weeksInTerm * input.lessonsPerWeek;

  return [
    "Create a teacher-ready Kenyan scheme of work.",
    `Stage: ${input.stage}`,
    `Class: ${input.classLabel}`,
    `Subject: ${input.subject}`,
    `Term: ${input.term}`,
    `Year: ${input.year}`,
    `School: ${input.schoolName || "Teacher provided school"}`,
    `Teacher: ${input.teacherName || "Teacher provided name"}`,
    `Reference text or book: ${input.textbook || "Not specified"}`,
    `Special teacher notes: ${input.notes || "None"}`,
    `Weeks in term: ${input.weeksInTerm}`,
    `Lessons per week: ${input.lessonsPerWeek}`,
    `Generate exactly ${rowCount} lesson rows.`,
    "Use practical, classroom-ready language for Kenyan teachers.",
    "Keep learning outcomes specific and measurable.",
    "Include realistic learning experiences, resources, assessments, and key inquiry questions.",
    "Return concise but usable planning entries that can be printed directly."
  ].join("\n");
}

function buildKiswahiliPrompt(input: SchemeGenerationInput) {
  const rowCount = input.weeksInTerm * input.lessonsPerWeek;

  return [
    "Tengeneza scheme of work ya mwalimu wa Kenya kwa namna ya kitaalamu.",
    `Ngazi: ${input.stage}`,
    `Darasa: ${input.classLabel}`,
    `Somo: ${input.subject}`,
    `Muhula: ${input.term}`,
    `Mwaka: ${input.year}`,
    `Shule: ${input.schoolName || "Shule ya mwalimu"}`,
    `Mwalimu: ${input.teacherName || "Jina la mwalimu"}`,
    `Kitabu au rejeleo: ${input.textbook || "Haijabainishwa"}`,
    `Maelekezo ya ziada: ${input.notes || "Hakuna"}`,
    `Wiki za muhula: ${input.weeksInTerm}`,
    `Vipindi kwa wiki: ${input.lessonsPerWeek}`,
    `Toa mistari ${rowCount} kamili ya vipindi.`,
    "Tumia Kiswahili fasaha na lugha ya kitaaluma ya walimu.",
    "Matokeo ya ujifunzaji yawe mahususi na yanayopimika.",
    "Jaza shughuli za ujifunzaji, maswali dadisi, nyenzo, tathmini, na maoni kwa njia inayoweza kutumika moja kwa moja darasani."
  ].join("\n");
}

function normalizeRows(rows: RawSchemeResponse["rows"]): SchemeDocumentRow[] {
  return rows.map((row, index) => ({
    weekLabel: row.weekLabel?.trim() || `${Math.floor(index / 2) + 1}`,
    lessonLabel: row.lessonLabel?.trim() || `${index + 1}`,
    strand: row.strand?.trim() || "Classroom Planning",
    subStrand: row.subStrand?.trim() || "Lesson Focus",
    outcomes: row.outcomes?.map((item) => item.trim()).filter(Boolean) ?? [],
    experiences:
      row.experiences?.map((item) => item.trim()).filter(Boolean) ?? [],
    keyInquiryQuestions:
      row.keyInquiryQuestions?.map((item) => item.trim()).filter(Boolean) ?? [],
    resources: row.resources?.map((item) => item.trim()).filter(Boolean) ?? [],
    assessment:
      row.assessment?.map((item) => item.trim()).filter(Boolean) ?? [],
    reflection: row.reflection?.trim() || ""
  }));
}

export async function generateSchemeDocumentContent(
  input: SchemeGenerationInput
): Promise<SchemeDocumentContent> {
  const model = getOpenAiSchemeModel();
  const title = buildTitle(input);
  const prompt =
    input.language === "sw"
      ? buildKiswahiliPrompt(input)
      : buildEnglishPrompt(input);

  const response = await getClient().responses.create({
    model,
    input: [
      {
        role: "system",
        content:
          input.language === "sw"
            ? "Wewe ni mtaalamu wa kupanga schemes of work za walimu wa Kenya. Toa mpangilio sahihi, wa vitendo, na wa kiwango cha darasa kilichotajwa."
            : "You are an expert Kenyan curriculum planning assistant. Produce accurate, practical, teacher-ready schemes of work for the requested class and subject."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_output_tokens: 9000,
    text: {
      format: {
        type: "json_schema",
        name: "scheme_of_work",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["subtitle", "rows"],
          properties: {
            subtitle: {
              type: "string",
              description:
                "One concise sentence describing the planning focus for the term."
            },
            rows: {
              type: "array",
              minItems: input.weeksInTerm * input.lessonsPerWeek,
              items: {
                type: "object",
                additionalProperties: false,
                required: [
                  "weekLabel",
                  "lessonLabel",
                  "strand",
                  "subStrand",
                  "outcomes",
                  "experiences",
                  "keyInquiryQuestions",
                  "resources",
                  "assessment",
                  "reflection"
                ],
                properties: {
                  weekLabel: { type: "string" },
                  lessonLabel: { type: "string" },
                  strand: { type: "string" },
                  subStrand: { type: "string" },
                  outcomes: {
                    type: "array",
                    items: { type: "string" }
                  },
                  experiences: {
                    type: "array",
                    items: { type: "string" }
                  },
                  keyInquiryQuestions: {
                    type: "array",
                    items: { type: "string" }
                  },
                  resources: {
                    type: "array",
                    items: { type: "string" }
                  },
                  assessment: {
                    type: "array",
                    items: { type: "string" }
                  },
                  reflection: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  });

  const rawJson = response.output_text?.trim();

  if (!rawJson) {
    throw new Error("The scheme generator did not return any content.");
  }

  const parsed = JSON.parse(rawJson) as RawSchemeResponse;

  return {
    title,
    subtitle: parsed.subtitle?.trim() || "Teacher-ready scheme of work",
    language: input.language,
    schoolName: input.schoolName.trim(),
    teacherName: input.teacherName.trim(),
    classLabel: input.classLabel.trim(),
    subject: input.subject.trim(),
    term: input.term.trim(),
    year: input.year,
    rows: normalizeRows(parsed.rows ?? [])
  };
}
