"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/validations/admin";
import type { ActionResult } from "@/lib/actions/admin-products";

// Settings can only be changed by admins (not staff) per the brief's
// role design (section 31): "Staff can manage orders and bookings but
// not critical business settings."
async function assertAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") throw new Error("Only admins can update business settings");
  return { supabase };
}

export async function updateSettings(rawInput: unknown): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("business_settings").update(parsed.data).eq("id", 1);
    if (error) return { success: false, error: error.message };
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
