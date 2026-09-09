"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { activitySchema } from "@/lib/validations/admin";
import type { ActionResult } from "@/lib/actions/admin-products";

async function assertStaff() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) throw new Error("Not authorized");
  return { supabase };
}

export async function createActivity(rawInput: unknown): Promise<ActionResult> {
  const parsed = activitySchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase } = await assertStaff();
    const { data, error } = await supabase.from("activities").insert(parsed.data).select("id").single();
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/activities");
    revalidatePath("/activities");
    return { success: true, id: data.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateActivity(id: string, rawInput: unknown): Promise<ActionResult> {
  const parsed = activitySchema.partial().safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("activities").update(parsed.data).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/activities");
    revalidatePath("/activities");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteActivity(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("activities").update({ is_active: false }).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/activities");
    revalidatePath("/activities");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
