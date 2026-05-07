import { NextRequest, NextResponse } from "next/server";
import { encodeNotice } from "@/lib/auth";
import { getCurrentMemberContext, hasAdminAccess } from "@/lib/membership";
import { initializePaystackTransaction } from "@/lib/paystack";
import {
  createSchemePaymentReference
} from "@/lib/scheme-payments";
import {
  createSchemeRequest,
  generateSchemeRequestOutput,
  getSchemeRequestById,
  getSchemeRequestForUser,
  hasUnlimitedSchemeAccess
} from "@/lib/scheme-bot";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTeacherDocumentKindLabel } from "@/lib/teacher-documents";
import type { TeacherDocumentKind } from "@/lib/types";

const SINGLE_DOCUMENT_PRICE_KES = 20;

function getSchemeBotDetailUrl(request: NextRequest, id: string, message?: string) {
  if (!message) {
    return new URL(`/scheme-bot/${id}`, request.url);
  }

  return new URL(`/scheme-bot/${id}?notice=${encodeNotice(message)}`, request.url);
}

function normalizeFollowUpKind(value: FormDataEntryValue | null) {
  const nextValue = String(value ?? "").trim();

  if (nextValue === "lesson-plan" || nextValue === "assessment") {
    return nextValue as TeacherDocumentKind;
  }

  return null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const formData = await request.formData();
  const outputKind = normalizeFollowUpKind(formData.get("output_kind"));
  const memberContext = await getCurrentMemberContext();

  if (!memberContext.user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(`/scheme-bot/${id}`)}`, request.url),
      { status: 303 }
    );
  }

  if (!outputKind) {
    return NextResponse.redirect(
      getSchemeBotDetailUrl(request, id, "Choose a valid follow-up document."),
      { status: 303 }
    );
  }

  const sourceRequest = hasAdminAccess(memberContext.profile)
    ? await getSchemeRequestById(id)
    : await getSchemeRequestForUser(id, memberContext.user.id);

  if (!sourceRequest) {
    return NextResponse.redirect(
      new URL(
        `/scheme-bot?notice=${encodeNotice("That source scheme could not be found.")}`,
        request.url
      ),
      { status: 303 }
    );
  }

  if (sourceRequest.outputKind !== "scheme" || sourceRequest.status !== "completed") {
    return NextResponse.redirect(
      getSchemeBotDetailUrl(
        request,
        sourceRequest.id,
        "Follow-up documents can only start from a completed scheme."
      ),
      { status: 303 }
    );
  }

  const accessMode = hasUnlimitedSchemeAccess(memberContext)
    ? "premium"
    : "single_purchase";
  const documentLabel = getTeacherDocumentKindLabel(outputKind);

  try {
    const followUpRequest = await createSchemeRequest({
      userId: memberContext.user.id,
      accessMode,
      input: {
        outputKind,
        sourceRequestId: sourceRequest.id,
        stage: sourceRequest.stage,
        classLabel: sourceRequest.classLabel,
        subject: sourceRequest.subject,
        term: sourceRequest.term,
        year: sourceRequest.year,
        schoolName: sourceRequest.schoolName,
        teacherName: sourceRequest.teacherName,
        textbook: sourceRequest.textbook,
        notes: sourceRequest.notes,
        weeksInTerm: sourceRequest.weeksInTerm,
        lessonsPerWeek: sourceRequest.lessonsPerWeek,
        language: sourceRequest.language
      }
    });

    if (accessMode === "premium") {
      try {
        const generated = await generateSchemeRequestOutput(followUpRequest.id);

        return NextResponse.redirect(
          getSchemeBotDetailUrl(
            request,
            generated.id,
            `${documentLabel} prepared successfully.`
          ),
          { status: 303 }
        );
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim()
            ? error.message
            : `We could not finish preparing that ${documentLabel.toLowerCase()} right now.`;

        return NextResponse.redirect(
          getSchemeBotDetailUrl(request, followUpRequest.id, message),
          { status: 303 }
        );
      }
    }

    if (!memberContext.user.email) {
      return NextResponse.redirect(
        getSchemeBotDetailUrl(
          request,
          sourceRequest.id,
          `Add an email to your account before paying for a ${documentLabel.toLowerCase()}.`
        ),
        { status: 303 }
      );
    }

    const adminSupabase = createAdminClient();
    const reference = createSchemePaymentReference(
      followUpRequest.id,
      memberContext.user.id
    );
    const paymentsTable = (adminSupabase as any).from(
      "scheme_payment_transactions"
    );
    const { error: createPaymentError } = await paymentsTable.insert({
      scheme_request_id: followUpRequest.id,
      user_id: memberContext.user.id,
      reference,
      amount_kes: SINGLE_DOCUMENT_PRICE_KES,
      currency: "KES",
      customer_email: memberContext.user.email
    });

    if (createPaymentError) {
      return NextResponse.redirect(
        getSchemeBotDetailUrl(
          request,
          sourceRequest.id,
          `We could not start the KSh 20 checkout for that ${documentLabel.toLowerCase()} right now.`
        ),
        { status: 303 }
      );
    }

    try {
      const checkout = await initializePaystackTransaction({
        email: memberContext.user.email,
        amountKes: SINGLE_DOCUMENT_PRICE_KES,
        reference,
        metadata: {
          purchase_type: "scheme",
          output_kind: outputKind,
          scheme_request_id: followUpRequest.id,
          user_id: memberContext.user.id
        }
      });

      const { error: updateError } = await paymentsTable
        .update({
          authorization_url: checkout.authorizationUrl,
          access_code: checkout.accessCode,
          raw_initialize: checkout.raw
        })
        .eq("reference", reference);

      if (updateError) {
        return NextResponse.redirect(
          getSchemeBotDetailUrl(
            request,
            sourceRequest.id,
            `We could not finish opening the ${documentLabel.toLowerCase()} checkout.`
          ),
          { status: 303 }
        );
      }

      return NextResponse.redirect(checkout.authorizationUrl, { status: 303 });
    } catch (error) {
      await paymentsTable.update({ status: "failed" }).eq("reference", reference);

      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : `We could not start the ${documentLabel.toLowerCase()} checkout right now.`;

      return NextResponse.redirect(
        getSchemeBotDetailUrl(request, sourceRequest.id, message),
        { status: 303 }
      );
    }
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : `We could not start that ${documentLabel.toLowerCase()} right now.`;

    return NextResponse.redirect(
      getSchemeBotDetailUrl(request, sourceRequest.id, message),
      { status: 303 }
    );
  }
}
