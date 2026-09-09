import { NextResponse, type NextRequest } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// This is where Paystack's hosted checkout page redirects the customer's
// browser back to after they attempt payment. We NEVER trust the query
// string alone (anyone could hand-craft a URL claiming success) — we
// always re-verify the transaction directly against Paystack's API using
// the reference, and only update the database based on that response.
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const type = request.nextUrl.searchParams.get("type"); // "order" | "experience_booking" | "activity_booking"
  const id = request.nextUrl.searchParams.get("id");

  if (!reference || !type || !id) {
    return NextResponse.redirect(`${SITE_URL}/?payment=invalid`);
  }

  let verified;
  try {
    verified = await verifyTransaction(reference);
  } catch {
    return NextResponse.redirect(`${SITE_URL}/?payment=error`);
  }

  const admin = createAdminClient();
  const paid = verified.status === "success";

  if (type === "order") {
    const { data: order } = await admin.from("orders").select("order_number, status").eq("id", id).single();
    if (!order) return NextResponse.redirect(`${SITE_URL}/?payment=error`);

    await admin
      .from("orders")
      .update({
        payment_status: paid ? "paid" : "failed",
        status: paid && order.status === "pending" ? "confirmed" : order.status,
      })
      .eq("id", id);

    return NextResponse.redirect(`${SITE_URL}/order/${order.order_number}?payment=${paid ? "success" : "failed"}`);
  }

  const isExperience = type === "experience_booking";
  const table = isExperience ? "experience_bookings" : "activity_bookings";
  const { data: booking } = await admin.from(table).select("booking_reference, status").eq("id", id).single();
  if (!booking) return NextResponse.redirect(`${SITE_URL}/?payment=error`);

  await admin
    .from(table)
    .update({
      payment_status: paid ? "paid" : "failed",
      status: paid && booking.status === "pending" ? "confirmed" : booking.status,
    })
    .eq("id", id);

  return NextResponse.redirect(`${SITE_URL}/booking/${booking.booking_reference}?payment=${paid ? "success" : "failed"}`);
}
