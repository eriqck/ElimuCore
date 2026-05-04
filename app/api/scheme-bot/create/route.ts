import { NextRequest, NextResponse } from "next/server";
import { encodeNotice } from "@/lib/auth";
import { getCurrentMemberContext } from "@/lib/membership";
import {
  createSchemeRequest,
  generateSchemeRequestOutput,
  hasUnlimitedSchemeAccess,
  type SchemeRequestCreateInput
} from "@/lib/scheme-bot";
import { initializePaystackTransaction } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSchemePaymentReference } from "@/lib/scheme-payments";
import type { SchemeLanguage, SchemeStage } from "@/lib/types";

const SINGLE_SCHEME_PRICE_KES = 20;

function getSchemeBotUrl(request: NextRequest, message?: string) {
  if (!message) {
    return new URL("/scheme-bot", request.url);
  }

  return new URL(`/scheme-bot?notice=${encodeNotice(message)}`, request.url);
}

function parsePositiveInteger(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseFormData(formData: FormData): SchemeRequestCreateInput {
  const stage = String(formData.get("stage") ?? "").trim() as SchemeStage;
  const classLabel = String(formData.get("class_label") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const term = String(formData.get("term") ?? "").trim();
  const year = parsePositiveInteger(formData.get("year"), new Date().getFullYear());
  const schoolName = String(formData.get("school_name") ?? "").trim();
  const teacherName = String(formData.get("teacher_name") ?? "").trim();
  const textbook = String(formData.get("textbook") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const weeksInTerm = parsePositiveInteger(formData.get("weeks_in_term"), 12);
  const lessonsPerWeek = parsePositiveInteger(formData.get("lessons_per_week"), 2);
  const language = String(formData.get("language") ?? "en").trim() as SchemeLanguage;

  if (!["pre-primary", "junior-school", "senior-school"].includes(stage)) {
    throw new Error("Choose a valid level.");
  }

  if (!classLabel) {
    throw new Error("Choose a class.");
  }

  if (!subject) {
    throw new Error("Choose or type a subject.");
  }

  if (!term) {
    throw new Error("Choose a term.");
  }

  if (!["en", "sw"].includes(language)) {
    throw new Error("Choose a valid output language.");
  }

  return {
    stage,
    classLabel,
    subject,
    term,
    year,
    schoolName,
    teacherName,
    textbook,
    notes,
    weeksInTerm,
    lessonsPerWeek,
    language
  };
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const memberContext = await getCurrentMemberContext();

  if (!memberContext.user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent("/scheme-bot")}`, request.url),
      { status: 303 }
    );
  }

  let input: SchemeRequestCreateInput;

  try {
    input = parseFormData(formData);
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Please complete the scheme form before continuing.";

    return NextResponse.redirect(getSchemeBotUrl(request, message), {
      status: 303
    });
  }

  try {
    const accessMode = hasUnlimitedSchemeAccess(memberContext)
      ? "premium"
      : "single_purchase";
    const schemeRequest = await createSchemeRequest({
      userId: memberContext.user.id,
      accessMode,
      input
    });

    if (accessMode === "premium") {
      try {
        const generated = await generateSchemeRequestOutput(schemeRequest.id);

        return NextResponse.redirect(
          new URL(
            `/scheme-bot/${generated.id}?notice=${encodeNotice("Scheme generated successfully.")}`,
            request.url
          ),
          { status: 303 }
        );
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim()
            ? error.message
            : "We could not finish generating your scheme right now.";

        return NextResponse.redirect(
          new URL(
            `/scheme-bot/${schemeRequest.id}?notice=${encodeNotice(message)}`,
            request.url
          ),
          { status: 303 }
        );
      }
    }

    if (!memberContext.user.email) {
      return NextResponse.redirect(
        getSchemeBotUrl(
          request,
          "Add an email to your account before paying for a single scheme."
        ),
        { status: 303 }
      );
    }

    const adminSupabase = createAdminClient();
    const reference = createSchemePaymentReference(
      schemeRequest.id,
      memberContext.user.id
    );
    const paymentsTable = (adminSupabase as any).from("scheme_payment_transactions");
    const { error: createPaymentError } = await paymentsTable.insert({
      scheme_request_id: schemeRequest.id,
      user_id: memberContext.user.id,
      reference,
      amount_kes: SINGLE_SCHEME_PRICE_KES,
      currency: "KES",
      customer_email: memberContext.user.email
    });

    if (createPaymentError) {
      return NextResponse.redirect(
        getSchemeBotUrl(
          request,
          "We could not start the KSh 20 payment right now. Please try again."
        ),
        { status: 303 }
      );
    }

    try {
      const checkout = await initializePaystackTransaction({
        email: memberContext.user.email,
        amountKes: SINGLE_SCHEME_PRICE_KES,
        reference,
        metadata: {
          purchase_type: "scheme",
          scheme_request_id: schemeRequest.id,
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
          getSchemeBotUrl(
            request,
            "We could not finish opening the scheme checkout."
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
          : "We could not start the scheme checkout right now.";

      return NextResponse.redirect(getSchemeBotUrl(request, message), {
        status: 303
      });
    }
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "We could not start the scheme generator right now.";

    return NextResponse.redirect(getSchemeBotUrl(request, message), {
      status: 303
    });
  }
}
