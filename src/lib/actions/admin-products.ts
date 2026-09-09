"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations/admin";

export interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

async function assertStaff() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) throw new Error("Not authorized");
  return { supabase, role: profile.role as "admin" | "staff" };
}

export async function createProduct(rawInput: unknown): Promise<ActionResult> {
  const parsed = productSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  try {
    const { supabase } = await assertStaff();
    const { data, error } = await supabase.from("products").insert(parsed.data).select("id").single();
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true, id: data.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateProduct(id: string, rawInput: unknown): Promise<ActionResult> {
  const parsed = productSchema.partial().safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("products").update(parsed.data).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true, id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// Soft delete: keeps history (orders reference products) while hiding it
// from the storefront immediately.
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function toggleProductField(
  id: string,
  field: "in_stock" | "is_featured" | "is_new_arrival" | "is_active",
  value: boolean
): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("products").update({ [field]: value }).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
