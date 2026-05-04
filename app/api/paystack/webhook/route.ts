import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentTransaction,
  settleVerifiedMembershipPayment
} from "@/lib/payments";
import {
  getSchemePaymentTransaction,
  settleVerifiedSchemePayment
} from "@/lib/scheme-payments";
import {
  parsePaystackWebhookPayload,
  verifyPaystackTransaction,
  verifyPaystackWebhookSignature
} from "@/lib/paystack";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: string;
  let reference: string;

  try {
    const parsed = parsePaystackWebhookPayload(rawBody);
    event = parsed.event;
    reference = parsed.reference;
  } catch {
    return NextResponse.json(
      { ok: true, ignored: true, reason: "invalid-payload" },
      { status: 200 }
    );
  }

  if (event !== "charge.success" || !reference) {
    return NextResponse.json(
      { ok: true, ignored: true, reason: "unsupported-event" },
      { status: 200 }
    );
  }

  const membershipPayment = await getPaymentTransaction(reference);

  if (membershipPayment) {
    if (
      membershipPayment.status === "success" &&
      membershipPayment.activated_membership_id
    ) {
      return NextResponse.json(
        { ok: true, processed: true, status: "already-active" },
        { status: 200 }
      );
    }

    try {
      const verification = await verifyPaystackTransaction(reference);
      const result = await settleVerifiedMembershipPayment({
        payment: membershipPayment,
        verification
      });

      return NextResponse.json(
        { ok: true, processed: true, status: result.outcome },
        { status: 200 }
      );
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Webhook processing failed.";

      return NextResponse.json(
        { ok: false, error: message },
        { status: 500 }
      );
    }
  }

  const schemePayment = await getSchemePaymentTransaction(reference);

  if (!schemePayment) {
    return NextResponse.json(
      { ok: true, ignored: true, reason: "unknown-reference" },
      { status: 200 }
    );
  }

  try {
    const verification = await verifyPaystackTransaction(reference);
    const result = await settleVerifiedSchemePayment({
      payment: schemePayment,
      verification
    });

    return NextResponse.json(
      { ok: true, processed: true, status: result.outcome },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Webhook processing failed.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
