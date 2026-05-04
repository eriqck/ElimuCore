import { NextRequest, NextResponse } from "next/server";
import { encodeNotice } from "@/lib/auth";
import {
  marketingEventCookieName,
  serializeMarketingEvents,
  type MarketingEventEnvelope
} from "@/lib/marketing";
import {
  getPaymentTransaction,
  settleVerifiedMembershipPayment
} from "@/lib/payments";
import {
  getSchemePaymentTransaction,
  settleVerifiedSchemePayment
} from "@/lib/scheme-payments";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { createClient } from "@/lib/supabase/server";

function redirectToAccount(request: NextRequest, message: string) {
  return NextResponse.redirect(
    new URL(`/account?notice=${encodeNotice(message)}`, request.url),
    { status: 303 }
  );
}

function attachMarketingEvents(
  response: NextResponse,
  events: MarketingEventEnvelope[]
) {
  response.cookies.set(marketingEventCookieName, serializeMarketingEvents(events), {
    path: "/",
    maxAge: 60 * 10,
    sameSite: "lax"
  });

  return response;
}

async function redirectAfterSuccess(
  request: NextRequest,
  userId: string,
  message: string
) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return NextResponse.redirect(
      new URL(
        `/login?message=${encodeNotice("Payment confirmed. Sign in to open your premium access.")}&next=${encodeURIComponent("/account")}`,
        request.url
      ),
      { status: 303 }
    );
  }

  return redirectToAccount(request, message);
}

async function redirectToSchemeRequest(
  request: NextRequest,
  userId: string,
  requestId: string,
  message: string
) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return NextResponse.redirect(
      new URL(
        `/login?message=${encodeNotice("Payment confirmed. Sign in to open your generated scheme.")}&next=${encodeURIComponent(`/scheme-bot/${requestId}`)}`,
        request.url
      ),
      { status: 303 }
    );
  }

  return NextResponse.redirect(
    new URL(
      `/scheme-bot/${requestId}?notice=${encodeNotice(message)}`,
      request.url
    ),
    { status: 303 }
  );
}

export async function GET(request: NextRequest) {
  const reference =
    request.nextUrl.searchParams.get("reference")?.trim() ||
    request.nextUrl.searchParams.get("trxref")?.trim() ||
    "";

  if (!reference) {
    return redirectToAccount(
      request,
      "We could not confirm that payment. Please try again from your account."
    );
  }

  const membershipPayment = await getPaymentTransaction(reference);

  if (membershipPayment) {
    if (membershipPayment.status === "success" && membershipPayment.activated_membership_id) {
      return redirectAfterSuccess(
        request,
        membershipPayment.user_id,
        "Payment confirmed. Your membership is already active."
      );
    }

    try {
      const verification = await verifyPaystackTransaction(reference);
      const result = await settleVerifiedMembershipPayment({
        payment: membershipPayment,
        verification
      });

      if (result.outcome !== "success") {
        return redirectToAccount(request, result.message);
      }

      const response = await redirectAfterSuccess(
        request,
        membershipPayment.user_id,
        result.message
      );

      return attachMarketingEvents(response, [
        {
          eventName: "Purchase",
          dedupeKey: `membership-purchase:${reference}`,
          payload: {
            value: membershipPayment.amount_kes,
            currency: membershipPayment.currency,
            content_name: membershipPayment.plan_slug,
            content_category: "membership",
            purchase_type: "membership",
            reference
          }
        }
      ]);
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "We could not verify that payment right now.";

      return redirectToAccount(request, message);
    }
  }

  const schemePayment = await getSchemePaymentTransaction(reference);

  if (!schemePayment) {
    return redirectToAccount(
      request,
      "We could not find that payment request. Please try again from your account."
    );
  }

  try {
    const verification = await verifyPaystackTransaction(reference);
    const result = await settleVerifiedSchemePayment({
      payment: schemePayment,
      verification
    });

    if (result.outcome !== "success") {
      return NextResponse.redirect(
        new URL(
          `/scheme-bot?notice=${encodeNotice(result.message)}`,
          request.url
        ),
        { status: 303 }
      );
    }

    const response = await redirectToSchemeRequest(
      request,
      schemePayment.user_id,
      result.requestId,
      result.message
    );

    return attachMarketingEvents(response, [
      {
        eventName: "Purchase",
        dedupeKey: `scheme-purchase:${reference}`,
        payload: {
          value: schemePayment.amount_kes,
          currency: schemePayment.currency,
          content_name: "Scheme Bot single purchase",
          content_category: "scheme_bot",
          purchase_type: "scheme",
          reference
        }
      }
    ]);
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "We could not verify that scheme payment right now.";

    return NextResponse.redirect(
      new URL(`/scheme-bot?notice=${encodeNotice(message)}`, request.url),
      { status: 303 }
    );
  }
}
