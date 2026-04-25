import { fallbackMembershipPlans } from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  MemberContext,
  MembershipPlan,
  MembershipStatus,
  UserMembership,
  UserProfile
} from "@/lib/types";

type MembershipPlanRow = {
  slug: string;
  name: string;
  duration_months: number;
  price_kes: number;
  description: string | null;
  active: boolean | null;
  sort_order: number | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "member" | "admin" | null;
};

type MembershipRow = {
  id: string;
  plan_slug: string;
  status: MembershipStatus;
  starts_at: string | null;
  expires_at: string | null;
  notes: string | null;
  membership_plans: MembershipPlanRow | MembershipPlanRow[] | null;
};

function normalizePlan(row: MembershipPlanRow): MembershipPlan {
  return {
    slug: row.slug,
    name: row.name,
    durationMonths: row.duration_months,
    priceKes: row.price_kes,
    description:
      row.description?.trim() || "Full unlimited access for active members.",
    active: row.active ?? true,
    sortOrder: row.sort_order ?? 0
  };
}

function resolveJoinedPlan(
  value: MembershipPlanRow | MembershipPlanRow[] | null
): MembershipPlan | null {
  if (!value) {
    return null;
  }

  const row = Array.isArray(value) ? value[0] : value;

  return row ? normalizePlan(row) : null;
}

function isMembershipActive(membership: {
  status: MembershipStatus;
  startsAt: string | null;
  expiresAt: string | null;
}) {
  if (membership.status !== "active") {
    return false;
  }

  const now = Date.now();
  const startsAt = membership.startsAt ? Date.parse(membership.startsAt) : null;
  const expiresAt = membership.expiresAt
    ? Date.parse(membership.expiresAt)
    : null;

  if (startsAt && Number.isFinite(startsAt) && startsAt > now) {
    return false;
  }

  if (expiresAt && Number.isFinite(expiresAt) && expiresAt < now) {
    return false;
  }

  return true;
}

export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  if (!hasSupabaseEnv()) {
    return fallbackMembershipPlans;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("membership_plans")
      .select("slug, name, duration_months, price_kes, description, active, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackMembershipPlans;
    }

    return (data as MembershipPlanRow[]).map((row) => normalizePlan(row));
  } catch {
    return fallbackMembershipPlans;
  }
}

export async function getCurrentMemberContext(): Promise<MemberContext> {
  const plans = await getMembershipPlans();

  if (!hasSupabaseEnv()) {
    return {
      user: null,
      profile: null,
      memberships: [],
      activeMembership: null,
      plans
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        user: null,
        profile: null,
        memberships: [],
        activeMembership: null,
        plans
      };
    }

    const [{ data: profileData }, { data: membershipData }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("memberships")
        .select(
          "id, plan_slug, status, starts_at, expires_at, notes, membership_plans(slug, name, duration_months, price_kes, description, active, sort_order)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    ]);

    const profileRow = (profileData ?? null) as ProfileRow | null;
    const memberships = ((membershipData ?? []) as MembershipRow[]).map(
      (membership): UserMembership => {
        const normalized = {
          id: membership.id,
          planSlug: membership.plan_slug,
          status: membership.status,
          startsAt: membership.starts_at,
          expiresAt: membership.expires_at,
          notes: membership.notes?.trim() ?? "",
          plan: resolveJoinedPlan(membership.membership_plans),
          isActive: false
        };

        normalized.isActive = isMembershipActive(normalized);
        return normalized;
      }
    );

    const activeMembership =
      memberships.find((membership) => membership.isActive) ?? null;
    const profile: UserProfile = {
      id: user.id,
      email: profileRow?.email?.trim() || user.email || "",
      fullName:
        profileRow?.full_name?.trim() ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "ELimuCore Member",
      role: profileRow?.role ?? "member"
    };

    return {
      user: {
        id: user.id,
        email: user.email || ""
      },
      profile,
      memberships,
      activeMembership,
      plans
    };
  } catch {
    return {
      user: null,
      profile: null,
      memberships: [],
      activeMembership: null,
      plans
    };
  }
}
