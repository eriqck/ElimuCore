import "server-only";
import {
  buildAssessmentDocxBuffer,
  buildLessonPlanDocxBuffer,
  buildSchemeDocxBuffer
} from "@/lib/scheme-docx";
import {
  generateSchemeDocumentContent,
  type SchemeGenerationInput
} from "@/lib/scheme-generator";
import {
  generateAssessmentDocumentContentFromScheme,
  generateLessonPlanDocumentContentFromScheme
} from "@/lib/teacher-documents";
import type {
  AssessmentDocumentContent,
  LessonPlanDocumentContent,
  MemberContext,
  SchemeAccessMode,
  SchemeDocumentContent,
  SchemeLanguage,
  SchemeRequest,
  SchemeRequestStatus,
  SchemeStage,
  TeacherDocumentKind
} from "@/lib/types";
import { hasPremiumAccess } from "@/lib/membership";
import { createAdminClient } from "@/lib/supabase/admin";

type TeacherDocumentContent =
  | SchemeDocumentContent
  | LessonPlanDocumentContent
  | AssessmentDocumentContent;

type SchemeRequestRow = {
  id: string;
  user_id: string;
  status: SchemeRequestStatus;
  access_mode: SchemeAccessMode;
  output_kind: TeacherDocumentKind | null;
  source_request_id: string | null;
  stage: SchemeStage;
  class_label: string;
  subject: string;
  term: string;
  year: number;
  school_name: string | null;
  teacher_name: string | null;
  textbook: string | null;
  notes: string | null;
  weeks_in_term: number;
  lessons_per_week: number;
  language: SchemeLanguage;
  generated_title: string | null;
  generated_overview: string | null;
  generated_json: unknown;
  storage_bucket: string | null;
  storage_path: string | null;
  error_message: string | null;
  paid_at: string | null;
  completed_at: string | null;
  created_at: string;
};

const schemeRequestSelect =
  "id, user_id, status, access_mode, output_kind, source_request_id, stage, class_label, subject, term, year, school_name, teacher_name, textbook, notes, weeks_in_term, lessons_per_week, language, generated_title, generated_overview, generated_json, storage_bucket, storage_path, error_message, paid_at, completed_at, created_at";

export type SchemeRequestCreateInput = {
  outputKind?: TeacherDocumentKind;
  sourceRequestId?: string | null;
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

function safeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function normalizeTeacherDocumentKind(
  value: TeacherDocumentKind | string | null | undefined
): TeacherDocumentKind {
  switch ((value ?? "").trim()) {
    case "lesson-plan":
      return "lesson-plan";
    case "assessment":
      return "assessment";
    default:
      return "scheme";
  }
}

function isSchemeDocumentContent(
  value: TeacherDocumentContent | null
): value is SchemeDocumentContent {
  return Boolean(value && "rows" in value);
}

function isLessonPlanDocumentContent(
  value: TeacherDocumentContent | null
): value is LessonPlanDocumentContent {
  return Boolean(value && "lessons" in value);
}

function isAssessmentDocumentContent(
  value: TeacherDocumentContent | null
): value is AssessmentDocumentContent {
  return Boolean(value && "sections" in value);
}

function normalizeGeneratedContent(
  value: unknown,
  outputKind: TeacherDocumentKind
): TeacherDocumentContent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const parsed = value as Partial<TeacherDocumentContent>;

  if (
    typeof parsed.title !== "string" ||
    typeof parsed.subtitle !== "string" ||
    typeof parsed.classLabel !== "string" ||
    typeof parsed.subject !== "string"
  ) {
    return null;
  }

  if (outputKind === "lesson-plan") {
    return Array.isArray((parsed as LessonPlanDocumentContent).lessons)
      ? (parsed as LessonPlanDocumentContent)
      : null;
  }

  if (outputKind === "assessment") {
    return Array.isArray((parsed as AssessmentDocumentContent).sections)
      ? (parsed as AssessmentDocumentContent)
      : null;
  }

  return Array.isArray((parsed as SchemeDocumentContent).rows)
    ? (parsed as SchemeDocumentContent)
    : null;
}

function normalizeSchemeRequest(row: SchemeRequestRow): SchemeRequest {
  const outputKind = normalizeTeacherDocumentKind(row.output_kind);

  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    accessMode: row.access_mode,
    outputKind,
    sourceRequestId: row.source_request_id,
    stage: row.stage,
    classLabel: row.class_label,
    subject: row.subject,
    term: row.term,
    year: row.year,
    schoolName: row.school_name?.trim() ?? "",
    teacherName: row.teacher_name?.trim() ?? "",
    textbook: row.textbook?.trim() ?? "",
    notes: row.notes?.trim() ?? "",
    weeksInTerm: row.weeks_in_term,
    lessonsPerWeek: row.lessons_per_week,
    language: row.language,
    generatedTitle: row.generated_title,
    generatedOverview: row.generated_overview?.trim() ?? "",
    generatedContent: normalizeGeneratedContent(row.generated_json, outputKind),
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    errorMessage: row.error_message?.trim() ?? "",
    paidAt: row.paid_at,
    completedAt: row.completed_at,
    createdAt: row.created_at
  };
}

function getStorageFileName(content: TeacherDocumentContent) {
  return `${content.title}.docx`;
}

function getStoragePath(request: SchemeRequest, title: string) {
  return [
    "scheme-bot",
    request.userId,
    request.outputKind,
    request.id,
    `${safeSlug(title)}.docx`
  ].join("/");
}

function buildGenerationInputFromRequest(
  request: SchemeRequest
): SchemeGenerationInput {
  return {
    stage: request.stage,
    classLabel: request.classLabel,
    subject: request.subject,
    term: request.term,
    year: request.year,
    schoolName: request.schoolName,
    teacherName: request.teacherName,
    textbook: request.textbook,
    notes: request.notes,
    weeksInTerm: request.weeksInTerm,
    lessonsPerWeek: request.lessonsPerWeek,
    language: request.language
  };
}

async function fetchSchemeRequestRow(requestId: string) {
  const supabase = createAdminClient();
  const schemeRequestsTable = (supabase as any).from("scheme_requests");
  const { data, error } = await schemeRequestsTable
    .select(schemeRequestSelect)
    .eq("id", requestId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as SchemeRequestRow;
}

async function resolveSourceSchemeContent(request: SchemeRequest) {
  if (request.sourceRequestId) {
    const sourceRow = await fetchSchemeRequestRow(request.sourceRequestId);
    const sourceRequest = sourceRow ? normalizeSchemeRequest(sourceRow) : null;

    if (sourceRequest?.outputKind === "scheme") {
      if (isSchemeDocumentContent(sourceRequest.generatedContent)) {
        return sourceRequest.generatedContent;
      }

      return generateSchemeDocumentContent(
        buildGenerationInputFromRequest(sourceRequest)
      );
    }
  }

  return generateSchemeDocumentContent(buildGenerationInputFromRequest(request));
}

async function buildTeacherDocumentOutput(request: SchemeRequest) {
  if (request.outputKind === "lesson-plan") {
    const sourceScheme = await resolveSourceSchemeContent(request);
    const content = generateLessonPlanDocumentContentFromScheme({
      scheme: sourceScheme,
      textbook: request.textbook
    });

    return {
      content,
      docxBuffer: await buildLessonPlanDocxBuffer(content)
    };
  }

  if (request.outputKind === "assessment") {
    const sourceScheme = await resolveSourceSchemeContent(request);
    const content = generateAssessmentDocumentContentFromScheme({
      scheme: sourceScheme,
      textbook: request.textbook
    });

    return {
      content,
      docxBuffer: await buildAssessmentDocxBuffer(content)
    };
  }

  const content = await generateSchemeDocumentContent(
    buildGenerationInputFromRequest(request)
  );

  return {
    content,
    docxBuffer: await buildSchemeDocxBuffer(content)
  };
}

export function hasUnlimitedSchemeAccess(memberContext: MemberContext) {
  return hasPremiumAccess(memberContext);
}

export async function listUserSchemeRequests(userId: string) {
  const supabase = createAdminClient();
  const schemeRequestsTable = (supabase as any).from("scheme_requests");
  const { data, error } = await schemeRequestsTable
    .select(schemeRequestSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    return [];
  }

  return (data as SchemeRequestRow[]).map((row) => normalizeSchemeRequest(row));
}

export async function getSchemeRequestForUser(requestId: string, userId: string) {
  const supabase = createAdminClient();
  const schemeRequestsTable = (supabase as any).from("scheme_requests");
  const { data, error } = await schemeRequestsTable
    .select(schemeRequestSelect)
    .eq("id", requestId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeSchemeRequest(data as SchemeRequestRow);
}

export async function getSchemeRequestById(requestId: string) {
  const row = await fetchSchemeRequestRow(requestId);
  return row ? normalizeSchemeRequest(row) : null;
}

export async function createSchemeRequest(args: {
  userId: string;
  accessMode: SchemeAccessMode;
  input: SchemeRequestCreateInput;
}) {
  const supabase = createAdminClient();
  const schemeRequestsTable = (supabase as any).from("scheme_requests");
  const initialStatus: SchemeRequestStatus =
    args.accessMode === "premium" ? "generating" : "pending_payment";
  const outputKind = normalizeTeacherDocumentKind(args.input.outputKind);

  const { data, error } = await schemeRequestsTable
    .insert({
      user_id: args.userId,
      status: initialStatus,
      access_mode: args.accessMode,
      output_kind: outputKind,
      source_request_id: args.input.sourceRequestId ?? null,
      stage: args.input.stage,
      class_label: args.input.classLabel,
      subject: args.input.subject,
      term: args.input.term,
      year: args.input.year,
      school_name: args.input.schoolName,
      teacher_name: args.input.teacherName,
      textbook: args.input.textbook,
      notes: args.input.notes,
      weeks_in_term: args.input.weeksInTerm,
      lessons_per_week: args.input.lessonsPerWeek,
      language: args.input.language
    })
    .select(schemeRequestSelect)
    .single();

  if (error || !data) {
    throw new Error("Could not start that teacher document right now.");
  }

  return normalizeSchemeRequest(data as SchemeRequestRow);
}

export async function markSchemeRequestGenerating(requestId: string) {
  const supabase = createAdminClient();
  const schemeRequestsTable = (supabase as any).from("scheme_requests");
  await schemeRequestsTable
    .update({
      status: "generating",
      error_message: ""
    })
    .eq("id", requestId);
}

export async function markSchemeRequestFailed(requestId: string, message: string) {
  const supabase = createAdminClient();
  const schemeRequestsTable = (supabase as any).from("scheme_requests");
  await schemeRequestsTable
    .update({
      status: "failed",
      error_message: message
    })
    .eq("id", requestId);
}

export async function generateSchemeRequestOutput(requestId: string) {
  const request = await getSchemeRequestById(requestId);

  if (!request) {
    throw new Error("Teacher document request not found.");
  }

  if (request.status === "completed" && request.storageBucket && request.storagePath) {
    return request;
  }

  await markSchemeRequestGenerating(requestId);

  try {
    const { content, docxBuffer } = await buildTeacherDocumentOutput(request);
    const fileName = getStorageFileName(content);
    const storagePath = getStoragePath(request, content.title);
    const supabase = createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from("scheme-documents")
      .upload(storagePath, docxBuffer, {
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true
      });

    if (uploadError) {
      throw new Error("Could not upload the generated document.");
    }

    const schemeRequestsTable = (supabase as any).from("scheme_requests");
    const { data: updatedData, error: updateError } = await schemeRequestsTable
      .update({
        status: "completed",
        generated_title: fileName,
        generated_overview: content.subtitle,
        generated_json: content,
        storage_bucket: "scheme-documents",
        storage_path: storagePath,
        completed_at: new Date().toISOString(),
        error_message: ""
      })
      .eq("id", request.id)
      .select(schemeRequestSelect)
      .single();

    if (updateError || !updatedData) {
      throw new Error("The document was created, but we could not save it.");
    }

    return normalizeSchemeRequest(updatedData as SchemeRequestRow);
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Could not finish preparing that document right now.";

    await markSchemeRequestFailed(request.id, message);
    throw new Error(message);
  }
}

export function getTeacherDocumentPreviewTitle(request: SchemeRequest) {
  if (request.generatedContent?.title) {
    return request.generatedContent.title;
  }

  return `${request.classLabel} ${request.subject}`;
}

export function getTeacherDocumentRowCount(request: SchemeRequest) {
  if (isSchemeDocumentContent(request.generatedContent)) {
    return request.generatedContent.rows.length;
  }

  if (isLessonPlanDocumentContent(request.generatedContent)) {
    return request.generatedContent.lessons.length;
  }

  if (isAssessmentDocumentContent(request.generatedContent)) {
    return request.generatedContent.sections.reduce(
      (sum, section) => sum + section.items.length,
      0
    );
  }

  if (request.outputKind === "lesson-plan") {
    return request.weeksInTerm * request.lessonsPerWeek;
  }

  if (request.outputKind === "assessment") {
    return Math.min(request.weeksInTerm, 10);
  }

  return request.weeksInTerm;
}
