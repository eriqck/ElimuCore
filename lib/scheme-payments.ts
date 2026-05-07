import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { type PaystackVerifyResult } from "@/lib/paystack";
import { createPaymentReference, normalizePaymentStatus } from "@/lib/payments";
import { generateSchemeRequestOutput } from "@/lib/scheme-bot";
import { getTeacherDocumentKindLabel } from "@/lib/teacher-documents";

export type SchemePaymentTransactionStatus =
  | "initialized"
  | "success"
  | "failed"
  | "abandoned";

export type SchemePaymentTransaction = {
  id: string;
  scheme_request_id: string;
  user_id: string;
  reference: string;
  status: SchemePaymentTransactionStatus;
  amount_kes: number;
  currency: string;
  customer_email: string;
};

export function createSchemePaymentReference(requestId: string, userId: string) {
  return createPaymentReference(`scheme-${requestId.slice(0, 8)}`, userId);
}

function getSchemePaymentsTable() {
  const supabase = createAdminClient();

  return (supabase as any).from("scheme_payment_transactions");
}

export async function getSchemePaymentTransaction(reference: string) {
  const { data, error } = await getSchemePaymentsTable()
    .select(
      "id, scheme_request_id, user_id, reference, status, amount_kes, currency, customer_email"
    )
    .eq("reference", reference)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as SchemePaymentTransaction;
}

export async function settleVerifiedSchemePayment(args: {
  payment: SchemePaymentTransaction;
  verification: PaystackVerifyResult;
}) {
  const paymentsTable = getSchemePaymentsTable();
  const { payment, verification } = args;
  const normalizedStatus = normalizePaymentStatus(verification.status);

  if (
    !verification.metadata ||
    verification.metadata.purchase_type !== "scheme" ||
    verification.metadata.scheme_request_id !== payment.scheme_request_id ||
    verification.metadata.user_id !== payment.user_id
  ) {
    await paymentsTable
      .update({
        status: "failed",
        raw_verify: verification.raw
      })
      .eq("reference", payment.reference);

    return {
      outcome: "mismatch" as const,
      message: "We could not match that payment to your teacher document request."
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
      message: "That payment did not match the KSh 20 teacher document purchase."
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

  const supabase = createAdminClient();
  const schemeRequestsTable = (supabase as any).from("scheme_requests");
  await schemeRequestsTable
    .update({
      paid_at: verification.paidAt || new Date().toISOString()
    })
    .eq("id", payment.scheme_request_id);

  const schemeRequest = await generateSchemeRequestOutput(payment.scheme_request_id);
  const documentLabel = getTeacherDocumentKindLabel(schemeRequest.outputKind);

  const { error: updateError } = await paymentsTable
    .update({
      status: "success",
      paystack_transaction_id: verification.transactionId,
      customer_email: verification.customerEmail || payment.customer_email,
      paid_at: verification.paidAt,
      raw_verify: verification.raw
    })
    .eq("reference", payment.reference);

  if (updateError) {
    throw new Error(
      "Payment was confirmed, but we could not save the final scheme receipt."
    );
  }

  return {
    outcome: "success" as const,
    message: `Payment confirmed. Your ${documentLabel.toLowerCase()} is ready.`,
    requestId: schemeRequest.id
  };
}
