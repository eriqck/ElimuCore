import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaystackVerifyResult } from "@/lib/paystack";

type MembershipPlanDurationRow = {
  duration_months: number;
};

type ActivatedMembershipRow = {
  id: string;
  expires_at: string | null;
};

export type PaymentTransactionRow = {
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

export type PaymentTransactionStatus =
  | "initialized"
  | "success"
  | "failed"
  | "abandoned";

export function createPaymentReference(planSlug: string, userId: string) {
  const safePlan = planSlug.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const safeUser = userId.replace(/[^a-z0-9]+/gi, "").slice(0, 8).toLowerCase();

  return `elimu_${safePlan}_${safeUser}_${Date.now()}`;
}

export function normalizePaymentStatus(status: string | null | undefined) {
  switch ((status ?? "").trim().toLowerCase()) {
    case "success":
      return "success";
    case "abandoned":
      return "abandoned";
    case "failed":
    case "cancelled":
    case "reversed":
      return "failed";
    default:
      return "initialized";
  }
}

function getPaymentsTable() {
  const supabase = createAdminClient();

  return (supabase as any).from("payment_transactions");
}

function addMonths(date: Date, months: number) {
  const value = new Date(date);
  value.setMonth(value.getMonth() + months);
  return value;
}

export async function activateMembershipFromPayment(args: {
  userId: string;
  planSlug: string;
  reference: string;
}) {
  const supabase = createAdminClient();
  const membershipsTable = (supabase as any).from("memberships");
  const membershipPlansTable = (supabase as any).from("membership_plans");
  const activationNote = `Activated via Paystack payment ${args.reference}`;
  const { data: existingMembershipData } = await membershipsTable
    .select("id, expires_at")
    .eq("user_id", args.userId)
    .eq("plan_slug", args.planSlug)
    .eq("notes", activationNote)
    .maybeSingle();
  const existingMembership = (existingMembershipData ?? null) as ActivatedMembershipRow | null;

  if (existingMembership) {
    return {
      id: existingMembership.id,
      expiresAt: existingMembership.expires_at
    };
  }

  const { data: planData, error: planError } = await membershipPlansTable
    .select("duration_months")
    .eq("slug", args.planSlug)
    .eq("active", true)
    .maybeSingle();
  const plan = (planData ?? null) as MembershipPlanDurationRow | null;

  if (planError || !plan) {
    throw new Error("That membership plan is not available right now.");
  }

  const startsAt = new Date();
  const expiresAt = addMonths(startsAt, plan.duration_months);

  const { error: expireError } = await membershipsTable
    .update({
      status: "expired",
      expires_at: startsAt.toISOString()
    })
    .eq("user_id", args.userId)
    .eq("status", "active");

  if (expireError) {
    throw new Error("Could not refresh the existing membership state.");
  }

  const { data: membershipData, error: membershipError } = await membershipsTable
    .insert({
      user_id: args.userId,
      plan_slug: args.planSlug,
      status: "active",
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      notes: activationNote
    })
    .select("id, expires_at")
    .single();
  const membership = (membershipData ?? null) as ActivatedMembershipRow | null;

  if (membershipError || !membership) {
    throw new Error("The payment was confirmed, but membership activation failed.");
  }

  return {
    id: membership.id,
    expiresAt: membership.expires_at
  };
}

export async function getPaymentTransaction(reference: string) {
  const paymentsTable = getPaymentsTable();
  const { data, error } = await paymentsTable
    .select(
      "id, user_id, plan_slug, reference, status, amount_kes, currency, customer_email, activated_membership_id"
    )
    .eq("reference", reference)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as PaymentTransactionRow;
}

export async function settleVerifiedMembershipPayment(args: {
  payment: PaymentTransactionRow;
  verification: PaystackVerifyResult;
}) {
  const paymentsTable = getPaymentsTable();
  const { payment, verification } = args;
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
      .eq("reference", payment.reference);

    return {
      outcome: "mismatch" as const,
      message: "We could not match that payment to your membership plan."
    };
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
      .eq("reference", payment.reference);

    return {
      outcome: "mismatch" as const,
      message: "That payment could not be matched to the selected membership."
    };
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
      .eq("reference", payment.reference);

    return {
      outcome: normalizedStatus === "abandoned" ? "abandoned" as const : "failed" as const,
      message: "Payment was not completed. Please try again when you are ready."
    };
  }

  const activatedMembership = await activateMembershipFromPayment({
    userId: payment.user_id,
    planSlug: payment.plan_slug,
    reference: payment.reference
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
    .eq("reference", payment.reference);

  if (updatePaymentError) {
    throw new Error(
      "Payment was confirmed, but we could not save the final receipt details."
    );
  }

  return {
    outcome: "success" as const,
    message: "Payment confirmed. Your membership is now active.",
    membershipId: activatedMembership.id
  };
}
