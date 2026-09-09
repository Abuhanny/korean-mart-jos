import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/settings-form";
import type { BusinessSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: settings }, { data: profile }] = await Promise.all([
    supabase.from("business_settings").select("*").eq("id", 1).single(),
    supabase.from("profiles").select("role").eq("id", user!.id).single(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold">Business Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Configure information used across the entire site — WhatsApp, hours, homepage content.
      </p>
      <SettingsForm settings={settings as BusinessSettings} isAdmin={profile?.role === "admin"} />
    </div>
  );
}
