import crypto from "crypto";

// Server-only. Never import this file from a Client Component — it reads
// PAYSTACK_SECRET_KEY, which must never reach the browser.
const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export interface InitializeTransactionParams {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeTransactionResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

// Starts a Paystack "Standard Checkout" transaction and returns a hosted
// payment page URL to redirect the customer to. The amount always comes
// from a value we already trust (the order/booking total computed server
// side) — never from anything the browser sends at this step.
export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResult> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountNaira * 100), // Paystack expects kobo
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: "NGN",
      metadata: params.metadata ?? {},
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data?.message ?? "Failed to initialize Paystack transaction");
  }
  return data.data as InitializeTransactionResult;
}

export interface VerifyTransactionResult {
  status: "success" | "failed" | "abandoned" | string;
  reference: string;
  amount: number; // kobo
  currency: string;
  metadata: Record<string, any>;
}

// Always re-verifies directly with Paystack's servers using the secret key
// — never trusts a `status=success` query param on the redirect URL alone,
// since that could be spoofed by anyone typing a URL.
export async function verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${getSecretKey()}` },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data?.message ?? "Failed to verify Paystack transaction");
  }

  return {
    status: data.data.status,
    reference: data.data.reference,
    amount: data.data.amount,
    currency: data.data.currency,
    metadata: data.data.metadata ?? {},
  };
}

// Verifies the `x-paystack-signature` header on incoming webhook requests
// so we only trust events that actually came from Paystack (HMAC-SHA512
// over the raw request body, keyed with the secret key).
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const hash = crypto.createHmac("sha512", getSecretKey()).update(rawBody).digest("hex");
  return hash === signatureHeader;
}
