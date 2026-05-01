import { NextRequest, NextResponse } from "next/server";
import { encodeNotice } from "@/lib/auth";
import {
  activateMembershipFromPayment,
  normalizePaymentStatus,
  type PaymentTransactionStatus
} from "@/lib/payments";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type PaymentTransactionRow = {
  id: string;
  user_id: string;
  plan_slug: string;
  reference: string;
  status: PaymentTransactionStatus;
  amount_kes: number;
  currency: string;
  customer_email: string;
  activated_membership_id: string | null;
};

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

  const adminSupabase = createAdminClient();
  const paymentsTable = (adminSupabase as any).from("payment_transactions");
  const { data: paymentData, error: paymentError } = await paymentsTable
    .select(
      "id, user_id, plan_slug, reference, status, amount_kes, currency, customer_email, activated_membership_id"
    )
    .eq("reference", reference)
    .maybeSingle();
  const payment = (paymentData ?? null) as PaymentTransactionRow | null;

  if (paymentError || !payment) {
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
    const normalizedStatus = normalizePaymentStatus(verification.status);

    if (
      verification.metadata &&
      (verification.metadata.plan_slug !== payment.plan_slug ||
        verification.metadata.user_id !== payment.user_id)
    ) {
      await paymentsTable
        .update({
          status: "failed",
          raw_verify: verification.raw
        })
        .eq("reference", reference);

      return redirectToAccount(
        request,
        "We could not match that payment to your membership plan."
      );
    }

    if (
      verification.reference !== payment.reference ||
      verification.amount !== payment.amount_kes * 100 ||
      verification.currency !== payment.currency
    ) {
      await paymentsTable
        .update({
          status: "failed",
          paystack_transaction_id: verification.transactionId,
          customer_email: verification.customerEmail || payment.customer_email,
          paid_at: verification.paidAt,
          raw_verify: verification.raw
        })
        .eq("reference", reference);

      return redirectToAccount(
        request,
        "That payment could not be matched to the selected membership."
      );
    }

    if (normalizedStatus !== "success") {
      await paymentsTable
        .update({
          status: normalizedStatus,
          paystack_transaction_id: verification.transactionId,
          customer_email: verification.customerEmail || payment.customer_email,
          paid_at: verification.paidAt,
          raw_verify: verification.raw
        })
        .eq("reference", reference);

      return redirectToAccount(
        request,
        "Payment was not completed. Please try again when you are ready."
      );
    }

    const activatedMembership = await activateMembershipFromPayment({
      userId: payment.user_id,
      planSlug: payment.plan_slug,
      reference
    });

    const { error: updatePaymentError } = await paymentsTable
      .update({
        status: "success",
        paystack_transaction_id: verification.transactionId,
        customer_email: verification.customerEmail || payment.customer_email,
        paid_at: verification.paidAt,
        activated_membership_id: activatedMembership.id,
        raw_verify: verification.raw
      })
      .eq("reference", reference);

    if (updatePaymentError) {
      return redirectToAccount(
        request,
        "Payment was confirmed, but we could not save the final receipt details."
      );
    }

    return redirectAfterSuccess(
      request,
      payment.user_id,
      "Payment confirmed. Your membership is now active."
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "We could not verify that payment right now.";

    return redirectToAccount(request, message);
  }
}
