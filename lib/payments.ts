import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type MembershipPlanDurationRow = {
  duration_months: number;
};

type ActivatedMembershipRow = {
  id: string;
  expires_at: string | null;
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
