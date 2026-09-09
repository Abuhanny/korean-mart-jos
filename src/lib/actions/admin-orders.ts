"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/admin-products";

async function assertStaff() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) throw new Error("Not authorized");
  return { supabase };
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    // A status change means the customer hasn't heard about this yet —
    // flip the reminder flag so it shows up as needing a WhatsApp follow-up.
    const { error } = await supabase.from("orders").update({ status, customer_notified: false }).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateOrderInternalNotes(id: string, internal_notes: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("orders").update({ internal_notes }).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath(`/admin/orders/${id}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
