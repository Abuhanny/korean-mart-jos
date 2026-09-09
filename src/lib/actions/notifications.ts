"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/admin-products";

async function assertStaff() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) throw new Error("Not authorized");
  return { supabase };
}

// Called when staff clicks "Contact on WhatsApp" for an order. We can't
// verify they actually hit send in WhatsApp, but clicking through is a
// reasonable signal — this clears the "needs notification" reminder badge.
export async function markOrderNotified(orderId: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase
      .from("orders")
      .update({ customer_notified: true, notified_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function markBookingNotified(
  kind: "experience" | "activity",
  bookingId: string
): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const table = kind === "experience" ? "experience_bookings" : "activity_bookings";
    const { error } = await supabase
      .from(table)
      .update({ customer_notified: true, notified_at: new Date().toISOString() })
      .eq("id", bookingId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
