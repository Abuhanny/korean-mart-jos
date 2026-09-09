import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";

// Paystack calls this endpoint directly from their servers (not the
// customer's browser), so it works even if the customer closes the tab
// before being redirected back — it's the reliable source of truth for
// payment status. The callback route (api/paystack/callback) exists purely
// for immediate UX; this webhook is what you can't skip in production.
//
// Configure this URL in the Paystack Dashboard under Settings > API Keys
// & Webhooks: {NEXT_PUBLIC_SITE_URL}/api/webhooks/paystack
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const admin = createAdminClient();

  if (event.event === "charge.success" || event.event === "charge.failed") {
    const paid = event.event === "charge.success";
    const metadata = event.data?.metadata ?? {};
    const type = metadata.type as string | undefined;

    if (type === "order" && metadata.order_id) {
      const { data: order } = await admin
        .from("orders")
        .select("status, payment_status")
        .eq("id", metadata.order_id)
        .single();
      // Idempotent: skip if we've already recorded this as paid (e.g. the
      // callback route already handled it).
      if (order && order.payment_status !== "paid") {
        await admin
          .from("orders")
          .update({
            payment_status: paid ? "paid" : "failed",
            status: paid && order.status === "pending" ? "confirmed" : order.status,
          })
          .eq("id", metadata.order_id);
      }
    } else if ((type === "experience_booking" || type === "activity_booking") && metadata.booking_id) {
      const table = type === "experience_booking" ? "experience_bookings" : "activity_bookings";
      const { data: booking } = await admin
        .from(table)
        .select("status, payment_status")
        .eq("id", metadata.booking_id)
        .single();
      if (booking && booking.payment_status !== "paid") {
        await admin
          .from(table)
          .update({
            payment_status: paid ? "paid" : "failed",
            status: paid && booking.status === "pending" ? "confirmed" : booking.status,
          })
          .eq("id", metadata.booking_id);
      }
    }
  }

  // Always 200 quickly so Paystack doesn't retry unnecessarily.
  return NextResponse.json({ received: true });
}
