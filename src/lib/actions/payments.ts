"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction } from "@/lib/paystack";

export interface PaymentInitResult {
  success: boolean;
  authorizationUrl?: string;
  error?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Starts (or retries) online payment for an already-created order. Called
// either right after checkout (payment_method === "online") or later from
// the order confirmation page's "Pay Now" / "Retry Payment" button.
//
// Uses the service-role client only for the narrow write of
// payment_reference/payment_status on this one row — everything else
// (which order, how much) is read fresh from the database, never trusted
// from the caller.
export async function initializeOrderPayment(orderId: string): Promise<PaymentInitResult> {
  const supabase = createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, total, customer_email, payment_status")
    .eq("id", orderId)
    .single();

  if (error || !order) return { success: false, error: "Order not found" };
  if (order.payment_status === "paid") return { success: false, error: "This order has already been paid for." };

  const reference = `KMORD-${order.order_number}-${Date.now()}`;

  try {
    const result = await initializeTransaction({
      email: order.customer_email || "guest@korea-mart-jos.local",
      amountNaira: order.total,
      reference,
      callbackUrl: `${SITE_URL}/api/paystack/callback?type=order&id=${order.id}`,
      metadata: { type: "order", order_id: order.id, order_number: order.order_number },
    });

    const admin = createAdminClient();
    await admin
      .from("orders")
      .update({ payment_method: "online", payment_status: "pending", payment_reference: reference })
      .eq("id", orderId);

    return { success: true, authorizationUrl: result.authorization_url };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function initializeBookingPayment(
  kind: "experience" | "activity",
  bookingId: string
): Promise<PaymentInitResult> {
  const supabase = createClient();
  const table = kind === "experience" ? "experience_bookings" : "activity_bookings";

  const { data: booking, error } = await supabase
    .from(table)
    .select("id, booking_reference, guests, customer_email, payment_status")
    .eq("id", bookingId)
    .single();

  if (error || !booking) return { success: false, error: "Booking not found" };
  if (booking.payment_status === "paid") return { success: false, error: "This booking has already been paid for." };

  // Re-derive the amount from the database (unit price × guests) rather
  // than trusting any total the client might send.
  let unitPrice = 0;
  if (kind === "experience") {
    const { data: full } = await supabase
      .from("experience_bookings")
      .select("guests, session:experience_sessions(price)")
      .eq("id", bookingId)
      .single();
    unitPrice = (full as any)?.session?.price ?? 0;
  } else {
    const { data: full } = await supabase
      .from("activity_bookings")
      .select("guests, activity:activities(price)")
      .eq("id", bookingId)
      .single();
    unitPrice = (full as any)?.activity?.price ?? 0;
  }

  const amount = unitPrice * booking.guests;
  const reference = `KM${kind === "experience" ? "EAT" : "ACT"}-${booking.booking_reference}-${Date.now()}`;

  try {
    const result = await initializeTransaction({
      email: booking.customer_email || "guest@korea-mart-jos.local",
      amountNaira: amount,
      reference,
      callbackUrl: `${SITE_URL}/api/paystack/callback?type=${kind}_booking&id=${booking.id}`,
      metadata: { type: `${kind}_booking`, booking_id: booking.id, booking_reference: booking.booking_reference },
    });

    const admin = createAdminClient();
    await admin
      .from(table)
      .update({ payment_method: "online", payment_status: "pending", payment_reference: reference })
      .eq("id", bookingId);

    return { success: true, authorizationUrl: result.authorization_url };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
