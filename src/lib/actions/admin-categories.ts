"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validations/admin";
import type { ActionResult } from "@/lib/actions/admin-products";

async function assertStaff() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) throw new Error("Not authorized");
  return { supabase };
}

export async function createCategory(rawInput: unknown): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("categories").insert(parsed.data);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateCategory(id: string, rawInput: unknown): Promise<ActionResult> {
  const parsed = categorySchema.partial().safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("categories").update(parsed.data).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    // Products referencing this category fall back to "uncategorized" (null)
    // rather than being deleted.
    await supabase.from("products").update({ category_id: null }).eq("category_id", id);
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
