"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { experienceSchema, sessionSchema } from "@/lib/validations/admin";
import type { ActionResult } from "@/lib/actions/admin-products";

async function assertStaff() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) throw new Error("Not authorized");
  return { supabase };
}

export async function createExperience(rawInput: unknown): Promise<ActionResult> {
  const parsed = experienceSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase } = await assertStaff();
    const { data, error } = await supabase.from("experiences").insert(parsed.data).select("id").single();
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/experiences");
    revalidatePath("/eat-cook");
    return { success: true, id: data.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateExperience(id: string, rawInput: unknown): Promise<ActionResult> {
  const parsed = experienceSchema.partial().safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("experiences").update(parsed.data).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/experiences");
    revalidatePath("/eat-cook");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("experiences").update({ is_active: false }).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/experiences");
    revalidatePath("/eat-cook");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createSession(rawInput: unknown): Promise<ActionResult> {
  const parsed = sessionSchema.safeParse(rawInput);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("experience_sessions").insert(parsed.data);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/experiences");
    revalidatePath("/eat-cook");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function closeSession(id: string, is_closed: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("experience_sessions").update({ is_closed }).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/experiences");
    revalidatePath("/eat-cook");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteSession(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("experience_sessions").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/experiences");
    revalidatePath("/eat-cook");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
