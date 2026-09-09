"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sessionBookingSchema, activityBookingSchema } from "@/lib/validations/booking";
import { initializeTransaction } from "@/lib/paystack";

export interface BookingResult {
  success: boolean;
  bookingReference?: string;
  authorizationUrl?: string;
  paymentError?: string;
  error?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Books an experience session via the `book_experience_session` RPC, which
// locks the session row and re-checks remaining capacity server-side before
// inserting — preventing overbooking even under concurrent requests.
//
// If the customer chose to pay online, this then starts a Paystack
// transaction for guests × session price (never a client-supplied total)
// and returns a hosted checkout URL. A Paystack failure doesn't roll back
// the booking — paying at the mart is always a valid fallback.
export async function bookExperienceSession(rawInput: unknown): Promise<BookingResult> {
  const parsed = sessionBookingSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("book_experience_session", {
    p_session_id: parsed.data.session_id,
    p_customer_name: parsed.data.customer_name,
    p_customer_phone: parsed.data.customer_phone,
    p_customer_email: parsed.data.customer_email || null,
    p_guests: parsed.data.guests,
    p_notes: parsed.data.notes || null,
  });

  if (error) return { success: false, error: error.message };

  const bookingId: string = data.id;
  const bookingReference: string = data.booking_reference;

  if (parsed.data.payment_method !== "online") {
    return { success: true, bookingReference };
  }

  try {
    const { data: session } = await supabase
      .from("experience_sessions")
      .select("price")
      .eq("id", parsed.data.session_id)
      .single();
    const amount = (session?.price ?? 0) * parsed.data.guests;
    const reference = `KMEAT-${bookingReference}-${Date.now()}`;

    const result = await initializeTransaction({
      email: parsed.data.customer_email || "guest@korea-mart-jos.local",
      amountNaira: amount,
      reference,
      callbackUrl: `${SITE_URL}/api/paystack/callback?type=experience_booking&id=${bookingId}`,
      metadata: { type: "experience_booking", booking_id: bookingId, booking_reference: bookingReference },
    });

    const admin = createAdminClient();
    await admin
      .from("experience_bookings")
      .update({ payment_method: "online", payment_status: "pending", payment_reference: reference })
      .eq("id", bookingId);

    return { success: true, bookingReference, authorizationUrl: result.authorization_url };
  } catch (e: any) {
    return { success: true, bookingReference, paymentError: e.message };
  }
}

export async function bookActivity(rawInput: unknown): Promise<BookingResult> {
  const parsed = activityBookingSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("book_activity", {
    p_activity_id: parsed.data.activity_id,
    p_customer_name: parsed.data.customer_name,
    p_customer_phone: parsed.data.customer_phone,
    p_customer_email: parsed.data.customer_email || null,
    p_guests: parsed.data.guests,
    p_notes: parsed.data.notes || null,
  });

  if (error) return { success: false, error: error.message };

  const bookingId: string = data.id;
  const bookingReference: string = data.booking_reference;

  if (parsed.data.payment_method !== "online") {
    return { success: true, bookingReference };
  }

  try {
    const { data: activity } = await supabase
      .from("activities")
      .select("price")
      .eq("id", parsed.data.activity_id)
      .single();
    const amount = (activity?.price ?? 0) * parsed.data.guests;
    const reference = `KMACT-${bookingReference}-${Date.now()}`;

    const result = await initializeTransaction({
      email: parsed.data.customer_email || "guest@korea-mart-jos.local",
      amountNaira: amount,
      reference,
      callbackUrl: `${SITE_URL}/api/paystack/callback?type=activity_booking&id=${bookingId}`,
      metadata: { type: "activity_booking", booking_id: bookingId, booking_reference: bookingReference },
    });

    const admin = createAdminClient();
    await admin
      .from("activity_bookings")
      .update({ payment_method: "online", payment_status: "pending", payment_reference: reference })
      .eq("id", bookingId);

    return { success: true, bookingReference, authorizationUrl: result.authorization_url };
  } catch (e: any) {
    return { success: true, bookingReference, paymentError: e.message };
  }
}

export async function getExperienceBookingByRef(ref: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_experience_booking_by_ref", { p_reference: ref });
  if (error || !data) return null;
  return { ...data.booking, session: { ...data.session, experience: data.experience } };
}

export async function getActivityBookingByRef(ref: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_activity_booking_by_ref", { p_reference: ref });
  if (error || !data) return null;
  return { ...data.booking, activity: data.activity };
}

// The /booking/[reference] page doesn't know ahead of time whether a
// reference belongs to an Eat & Cook session or an activity, so try both.
// References are prefixed (KM-EAT-xxxx vs KM-ACT-xxxx) which makes this a
// single lookup in practice, but falling back covers any edge case safely.
export async function getBookingByReference(
  ref: string
): Promise<{ kind: "experience" | "activity"; booking: any } | null> {
  if (ref.startsWith("KM-EAT-")) {
    const booking = await getExperienceBookingByRef(ref);
    return booking ? { kind: "experience", booking } : null;
  }
  if (ref.startsWith("KM-ACT-")) {
    const booking = await getActivityBookingByRef(ref);
    return booking ? { kind: "activity", booking } : null;
  }
  const exp = await getExperienceBookingByRef(ref);
  if (exp) return { kind: "experience", booking: exp };
  const act = await getActivityBookingByRef(ref);
  if (act) return { kind: "activity", booking: act };
  return null;
}
