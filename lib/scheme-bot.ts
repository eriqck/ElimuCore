import "server-only";
import { buildSchemeDocxBuffer } from "@/lib/scheme-docx";
import {
  generateSchemeDocumentContent,
  type SchemeGenerationInput
} from "@/lib/scheme-generator";
import type {
  MemberContext,
  SchemeAccessMode,
  SchemeDocumentContent,
  SchemeLanguage,
  SchemeRequest,
  SchemeRequestStatus,
  SchemeStage
} from "@/lib/types";
import { hasPremiumAccess } from "@/lib/membership";
import { createAdminClient } from "@/lib/supabase/admin";

type SchemeRequestRow = {
  id: string;
  user_id: string;
  status: SchemeRequestStatus;
  access_mode: SchemeAccessMode;
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

export type SchemeRequestCreateInput = {
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

function normalizeGeneratedContent(value: unknown): SchemeDocumentContent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const parsed = value as Partial<SchemeDocumentContent>;

  if (
    typeof parsed.title !== "string" ||
    typeof parsed.subtitle !== "string" ||
    !Array.isArray(parsed.rows)
  ) {
    return null;
  }

  return parsed as SchemeDocumentContent;
}

function normalizeSchemeRequest(row: SchemeRequestRow): SchemeRequest {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    accessMode: row.access_mode,
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
    generatedContent: normalizeGeneratedContent(row.generated_json),
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    errorMessage: row.error_message?.trim() ?? "",
    paidAt: row.paid_at,
    completedAt: row.completed_at,
    createdAt: row.created_at
  };
}

function getStorageFileName(content: SchemeDocumentContent) {
  return `${content.title}.docx`;
}

function getStoragePath(request: SchemeRequest, title: string) {
  return [
    "scheme-bot",
    request.userId,
    request.id,
    `${safeSlug(title)}.docx`
  ].join("/");
}

export function hasUnlimitedSchemeAccess(memberContext: MemberContext) {
  return hasPremiumAccess(memberContext);
}

export async function listUserSchemeRequests(userId: string) {
  const supabase = createAdminClient();
  const schemeRequestsTable = (supabase as any).from("scheme_requests");
  const { data, error } = await schemeRequestsTable
    .select(
      "id, user_id, status, access_mode, stage, class_label, subject, term, year, school_name, teacher_name, textbook, notes, weeks_in_term, lessons_per_week, language, generated_title, generated_overview, generated_json, storage_bucket, storage_path, error_message, paid_at, completed_at, created_at"
    )
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
    .select(
      "id, user_id, status, access_mode, stage, class_label, subject, term, year, school_name, teacher_name, textbook, notes, weeks_in_term, lessons_per_week, language, generated_title, generated_overview, generated_json, storage_bucket, storage_path, error_message, paid_at, completed_at, created_at"
    )
    .eq("id", requestId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeSchemeRequest(data as SchemeRequestRow);
}

export async function getSchemeRequestById(requestId: string) {
  const supabase = createAdminClient();
  const schemeRequestsTable = (supabase as any).from("scheme_requests");
  const { data, error } = await schemeRequestsTable
    .select(
      "id, user_id, status, access_mode, stage, class_label, subject, term, year, school_name, teacher_name, textbook, notes, weeks_in_term, lessons_per_week, language, generated_title, generated_overview, generated_json, storage_bucket, storage_path, error_message, paid_at, completed_at, created_at"
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeSchemeRequest(data as SchemeRequestRow);
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

  const { data, error } = await schemeRequestsTable
    .insert({
      user_id: args.userId,
      status: initialStatus,
      access_mode: args.accessMode,
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
    .select(
      "id, user_id, status, access_mode, stage, class_label, subject, term, year, school_name, teacher_name, textbook, notes, weeks_in_term, lessons_per_week, language, generated_title, generated_overview, generated_json, storage_bucket, storage_path, error_message, paid_at, completed_at, created_at"
    )
    .single();

  if (error || !data) {
    throw new Error("Could not start that scheme request right now.");
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
  const supabase = createAdminClient();
  const schemeRequestsTable = (supabase as any).from("scheme_requests");
  const { data, error } = await schemeRequestsTable
    .select(
      "id, user_id, status, access_mode, stage, class_label, subject, term, year, school_name, teacher_name, textbook, notes, weeks_in_term, lessons_per_week, language, generated_title, generated_overview, generated_json, storage_bucket, storage_path, error_message, paid_at, completed_at, created_at"
    )
    .eq("id", requestId)
    .maybeSingle();

  const request = data ? normalizeSchemeRequest(data as SchemeRequestRow) : null;

  if (error || !request) {
    throw new Error("Scheme request not found.");
  }

  if (request.status === "completed" && request.storageBucket && request.storagePath) {
    return request;
  }

  await markSchemeRequestGenerating(requestId);

  try {
    const content = await generateSchemeDocumentContent({
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
    } satisfies SchemeGenerationInput);
    const fileName = getStorageFileName(content);
    const storagePath = getStoragePath(request, content.title);
    const docxBuffer = await buildSchemeDocxBuffer(content);

    const { error: uploadError } = await supabase.storage
      .from("scheme-documents")
      .upload(storagePath, docxBuffer, {
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true
      });

    if (uploadError) {
      throw new Error("Could not upload the generated scheme document.");
    }

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
      .select(
        "id, user_id, status, access_mode, stage, class_label, subject, term, year, school_name, teacher_name, textbook, notes, weeks_in_term, lessons_per_week, language, generated_title, generated_overview, generated_json, storage_bucket, storage_path, error_message, paid_at, completed_at, created_at"
      )
      .single();

    if (updateError || !updatedData) {
      throw new Error("The scheme file was created, but we could not save it.");
    }

    return normalizeSchemeRequest(updatedData as SchemeRequestRow);
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Could not finish preparing that scheme right now.";

    await markSchemeRequestFailed(request.id, message);
    throw new Error(message);
  }
}
