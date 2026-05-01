import "server-only";
import { getPaystackSecretKey, getSiteUrl } from "@/lib/supabase/env";

type PaystackInitializeMetadata = {
  plan_slug: string;
  user_id: string;
};

type PaystackCustomer = {
  email?: string | null;
};

type PaystackInitializeData = {
  authorization_url?: string;
  access_code?: string;
  reference?: string;
};

type PaystackVerifyData = {
  id?: number | string;
  status?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  paid_at?: string | null;
  metadata?: unknown;
  customer?: PaystackCustomer | null;
};

type PaystackResponse<TData> = {
  status?: boolean;
  message?: string;
  data?: TData;
};

export type PaystackInitializeResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  raw: PaystackResponse<PaystackInitializeData>;
};

export type PaystackVerifyResult = {
  transactionId: string;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paidAt: string | null;
  customerEmail: string;
  metadata: PaystackInitializeMetadata | null;
  raw: PaystackResponse<PaystackVerifyData>;
};

function getAuthorizationHeader() {
  return `Bearer ${getPaystackSecretKey()}`;
}

function getPaystackCallbackUrl() {
  return new URL("/payments/paystack/callback", `${getSiteUrl()}/`).toString();
}

function getPaystackErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string" &&
    payload.message.trim()
  ) {
    return payload.message.trim();
  }

  return fallback;
}

function parseMetadata(value: unknown): PaystackInitializeMetadata | null {
  if (!value) {
    return null;
  }

  const parsed =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        })()
      : value;

  if (
    parsed &&
    typeof parsed === "object" &&
    "plan_slug" in parsed &&
    "user_id" in parsed &&
    typeof parsed.plan_slug === "string" &&
    typeof parsed.user_id === "string"
  ) {
    return {
      plan_slug: parsed.plan_slug,
      user_id: parsed.user_id
    };
  }

  return null;
}

export async function initializePaystackTransaction(args: {
  email: string;
  amountKes: number;
  reference: string;
  metadata: PaystackInitializeMetadata;
}) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: args.email,
      amount: args.amountKes * 100,
      currency: "KES",
      reference: args.reference,
      callback_url: getPaystackCallbackUrl(),
      metadata: JSON.stringify(args.metadata)
    }),
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => null)) as PaystackResponse<PaystackInitializeData> | null;

  if (
    !response.ok ||
    !payload?.status ||
    !payload.data?.authorization_url ||
    !payload.data.access_code ||
    !payload.data.reference
  ) {
    throw new Error(
      getPaystackErrorMessage(
        payload,
        "Could not start Paystack checkout right now."
      )
    );
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    accessCode: payload.data.access_code,
    reference: payload.data.reference,
    raw: payload
  } satisfies PaystackInitializeResult;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: getAuthorizationHeader()
      },
      cache: "no-store"
    }
  );

  const payload = (await response.json().catch(() => null)) as PaystackResponse<PaystackVerifyData> | null;

  if (!response.ok || !payload?.status || !payload.data) {
    throw new Error(
      getPaystackErrorMessage(
        payload,
        "Could not verify the Paystack payment right now."
      )
    );
  }

  return {
    transactionId: String(payload.data.id ?? ""),
    status: String(payload.data.status ?? "").trim().toLowerCase(),
    reference: String(payload.data.reference ?? reference),
    amount: Number(payload.data.amount ?? 0),
    currency: String(payload.data.currency ?? "").trim().toUpperCase(),
    paidAt: payload.data.paid_at ?? null,
    customerEmail: payload.data.customer?.email?.trim() ?? "",
    metadata: parseMetadata(payload.data.metadata),
    raw: payload
  } satisfies PaystackVerifyResult;
}
