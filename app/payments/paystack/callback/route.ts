import { NextRequest, NextResponse } from "next/server";
import { encodeNotice } from "@/lib/auth";
import {
  getPaymentTransaction,
  settleVerifiedMembershipPayment
} from "@/lib/payments";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { createClient } from "@/lib/supabase/server";

function redirectToAccount(request: NextRequest, message: string) {
  return NextResponse.redirect(
    new URL(`/account?notice=${encodeNotice(message)}`, request.url),
    { status: 303 }
  );
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

  const payment = await getPaymentTransaction(reference);

  if (!payment) {
    return redirectToAccount(
      request,
      "We could not find that payment request. Please try again from your account."
    );
  }

  if (payment.status === "success" && payment.activated_membership_id) {
    return redirectAfterSuccess(
      request,
      payment.user_id,
      "Payment confirmed. Your membership is already active."
    );
  }

  try {
    const verification = await verifyPaystackTransaction(reference);
    const result = await settleVerifiedMembershipPayment({
      payment,
      verification
    });

    if (result.outcome !== "success") {
      return redirectToAccount(request, result.message);
    }

    return redirectAfterSuccess(
      request,
      payment.user_id,
      result.message
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "We could not verify that payment right now.";

    return redirectToAccount(request, message);
  }
}
