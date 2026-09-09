"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { promotionSchema } from "@/lib/validations/admin";
import type { ActionResult } from "@/lib/actions/admin-products";

async function assertStaff() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) throw new Error("Not authorized");
  return { supabase };
}

export async function createPromotion(rawInput: unknown): Promise<ActionResult> {
  const parsed = promotionSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("promotions").insert(parsed.data);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/promotions");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updatePromotion(id: string, rawInput: unknown): Promise<ActionResult> {
  const parsed = promotionSchema.partial().safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("promotions").update(parsed.data).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/promotions");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deletePromotion(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/promotions");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
