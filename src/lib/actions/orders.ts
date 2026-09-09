"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutSchema } from "@/lib/validations/checkout";
import { initializeTransaction } from "@/lib/paystack";
import type { CartItem } from "@/lib/types";

export interface PlaceOrderResult {
  success: boolean;
  orderNumber?: string;
  authorizationUrl?: string;
  paymentError?: string;
  error?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Places an order by calling the `place_order` Postgres function, which
// re-validates price, active status, and stock against the products table
// server-side. The client-supplied `items` only ever provide product_id +
// quantity — price and totals are never trusted from the browser.
//
// If the customer chose to pay online, this also starts a Paystack
// transaction using the order's real total (read back from the row we just
// created) and returns a hosted checkout URL for the client to redirect to.
// If Paystack initialization fails, the order still exists (pay-on-pickup
// is always a safe fallback) — we surface `paymentError` so the UI can tell
// the customer they can retry payment or pay at pickup instead.
export async function placeOrder(
  rawInput: unknown,
  items: CartItem[]
): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!items || items.length === 0) {
    return { success: false, error: "Your cart is empty" };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_customer_name: parsed.data.customer_name,
    p_customer_phone: parsed.data.customer_phone,
    p_customer_email: parsed.data.customer_email || null,
    p_fulfillment: parsed.data.fulfillment,
    p_delivery_address: parsed.data.delivery_address || null,
    p_notes: parsed.data.notes || null,
    p_items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const orderId: string = data.id;
  const orderNumber: string = data.order_number;

  if (parsed.data.payment_method !== "online") {
    return { success: true, orderNumber };
  }

  const reference = `KMORD-${orderNumber}-${Date.now()}`;

  try {
    const result = await initializeTransaction({
      email: parsed.data.customer_email || "guest@korea-mart-jos.local",
      amountNaira: Number(data.total),
      reference,
      callbackUrl: `${SITE_URL}/api/paystack/callback?type=order&id=${orderId}`,
      metadata: { type: "order", order_id: orderId, order_number: orderNumber },
    });

    const admin = createAdminClient();
    await admin
      .from("orders")
      .update({ payment_method: "online", payment_status: "pending", payment_reference: reference })
      .eq("id", orderId);

    return { success: true, orderNumber, authorizationUrl: result.authorization_url };
  } catch (e: any) {
    // Order is already placed at this point — don't fail the whole
    // checkout just because the payment gateway had an issue.
    return { success: true, orderNumber, paymentError: e.message };
  }
}

export async function getOrderByNumber(orderNumber: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_order_by_number", { p_order_number: orderNumber });
  if (error || !data) return null;
  return { ...data.order, order_items: data.order_items };
}
