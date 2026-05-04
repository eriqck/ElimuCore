import { NextRequest, NextResponse } from "next/server";
import { encodeNotice } from "@/lib/auth";
import { createPaymentReference } from "@/lib/payments";
import { initializePaystackTransaction } from "@/lib/paystack";
import { getCanonicalMembershipPrice } from "@/lib/pricing";
import { getCurrentMemberContext } from "@/lib/membership";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type MembershipPlanCheckoutRow = {
  slug: string;
  name: string;
  price_kes: number;
  active: boolean | null;
};

function getAccountUrl(request: NextRequest, message: string) {
  return new URL(`/account?notice=${encodeNotice(message)}`, request.url);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const planSlug = String(formData.get("plan_slug") ?? "").trim();

  if (!planSlug) {
    return NextResponse.redirect(
      getAccountUrl(request, "Choose a membership plan to continue."),
      { status: 303 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent("/account")}`, request.url),
      { status: 303 }
    );
  }

  if (!user.email) {
    return NextResponse.redirect(
      getAccountUrl(request, "Add an email address to your account before paying."),
      { status: 303 }
    );
  }

  const memberContext = await getCurrentMemberContext();

  if (memberContext.activeMembership) {
    return NextResponse.redirect(
      getAccountUrl(
        request,
        "Your membership is already active. Contact support if you need help changing plans."
      ),
      { status: 303 }
    );
  }

  try {
    const adminSupabase = createAdminClient();
    const paymentsTable = (adminSupabase as any).from("payment_transactions");
    const { data: planData, error: planError } = await adminSupabase
      .from("membership_plans")
      .select("slug, name, price_kes, active")
      .eq("slug", planSlug)
      .eq("active", true)
      .maybeSingle();
    const plan = (planData ?? null) as MembershipPlanCheckoutRow | null;

    if (planError || !plan) {
      return NextResponse.redirect(
        getAccountUrl(request, "That membership plan is not available right now."),
        { status: 303 }
      );
    }

    const amountKes = getCanonicalMembershipPrice(plan.slug, plan.price_kes);
    const reference = createPaymentReference(plan.slug, user.id);
    const { error: createTransactionError } = await paymentsTable
      .insert({
        user_id: user.id,
        plan_slug: plan.slug,
        reference,
        amount_kes: amountKes,
        currency: "KES",
        customer_email: user.email
      });

    if (createTransactionError) {
      return NextResponse.redirect(
        getAccountUrl(
          request,
          "We could not start your payment right now. Please try again."
        ),
        { status: 303 }
      );
    }

    try {
      const checkout = await initializePaystackTransaction({
        email: user.email,
        amountKes,
        reference,
        metadata: {
          purchase_type: "membership",
          plan_slug: plan.slug,
          user_id: user.id
        }
      });

      const { error: updateTransactionError } = await paymentsTable
        .update({
          authorization_url: checkout.authorizationUrl,
          access_code: checkout.accessCode,
          raw_initialize: checkout.raw
        })
        .eq("reference", reference);

      if (updateTransactionError) {
        return NextResponse.redirect(
          getAccountUrl(
            request,
            "We could not finish opening checkout. Please try again."
          ),
          { status: 303 }
        );
      }

      return NextResponse.redirect(checkout.authorizationUrl, { status: 303 });
    } catch (error) {
      await paymentsTable
        .update({
          status: "failed"
        })
        .eq("reference", reference);

      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "We could not start Paystack checkout right now.";

      return NextResponse.redirect(getAccountUrl(request, message), {
        status: 303
      });
    }
  } catch {
    return NextResponse.redirect(
      getAccountUrl(
        request,
        "Payments are not ready just now. Please try again shortly."
      ),
      { status: 303 }
    );
  }
}
