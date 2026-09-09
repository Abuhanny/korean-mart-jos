"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/admin-products";

async function assertStaff() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) throw new Error("Not authorized");
  return { supabase };
}

export async function updateExperienceBookingStatus(id: string, status: BookingStatus): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase
      .from("experience_bookings")
      .update({ status, customer_notified: false })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateActivityBookingStatus(id: string, status: BookingStatus): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase
      .from("activity_bookings")
      .update({ status, customer_notified: false })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
