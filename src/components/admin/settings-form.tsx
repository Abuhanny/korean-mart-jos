"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { settingsSchema, type SettingsInput } from "@/lib/validations/admin";
import { updateSettings } from "@/lib/actions/admin-settings";
import type { BusinessSettings } from "@/lib/types";

const DAYS: (keyof BusinessSettings["opening_hours"])[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

export function SettingsForm({ settings, isAdmin }: { settings: BusinessSettings; isAdmin: boolean }) {
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      business_name: settings.business_name,
      description: settings.description,
      phone: settings.phone,
      whatsapp_number: settings.whatsapp_number,
      email: settings.email ?? "",
      address: settings.address,
      google_maps_url: settings.google_maps_url ?? "",
      instagram_url: settings.instagram_url ?? "",
      facebook_url: settings.facebook_url ?? "",
      hero_title: settings.hero_title,
      hero_subtitle: settings.hero_subtitle,
      hero_image_url: settings.hero_image_url ?? "",
      promo_banner_text: settings.promo_banner_text ?? "",
      promo_banner_active: settings.promo_banner_active,
      opening_hours: settings.opening_hours,
    },
  });

  const onSubmit = async (values: SettingsInput) => {
    setSubmitting(true);
    const result = await updateSettings(values);
    setSubmitting(false);
    if (!result.success) toast.error(result.error ?? "Failed to save settings");
    else toast.success("Settings saved — changes are live on the site.");
  };

  if (!isAdmin) {
    return (
      <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Only admin accounts can change business settings. Contact your business owner/admin for changes.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-2xl border border-border/60 p-5">
        <h2 className="mb-4 font-semibold">Business Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Business Name</Label>
            <Input {...register("business_name")} className="mt-1.5" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register("phone")} className="mt-1.5" />
          </div>
          <div>
            <Label>WhatsApp Number</Label>
            <Input {...register("whatsapp_number")} className="mt-1.5" placeholder="2348012345678" />
            <p className="mt-1 text-xs text-muted-foreground">Digits only, with country code. Used across the whole site.</p>
          </div>
          <div>
            <Label>Email (optional)</Label>
            <Input {...register("email")} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input {...register("address")} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>Google Maps URL</Label>
            <Input {...register("google_maps_url")} className="mt-1.5" />
          </div>
          <div>
            <Label>Instagram URL</Label>
            <Input {...register("instagram_url")} className="mt-1.5" />
          </div>
          <div>
            <Label>Facebook URL</Label>
            <Input {...register("facebook_url")} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>Business Description</Label>
            <Textarea {...register("description")} className="mt-1.5" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 p-5">
        <h2 className="mb-4 font-semibold">Opening Hours</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {DAYS.map((day) => (
            <div key={day}>
              <Label className="capitalize">{day}</Label>
              <Input {...register(`opening_hours.${day}` as const)} className="mt-1.5" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 p-5">
        <h2 className="mb-4 font-semibold">Homepage Content</h2>
        <div className="space-y-4">
          <div>
            <Label>Hero Title</Label>
            <Input {...register("hero_title")} className="mt-1.5" />
          </div>
          <div>
            <Label>Hero Subtitle</Label>
            <Textarea {...register("hero_subtitle")} className="mt-1.5" />
          </div>
          <div>
            <Label>Hero Image URL</Label>
            <Input {...register("hero_image_url")} className="mt-1.5" />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-accent/40 p-3">
            <span className="text-sm">Show promo banner</span>
            <Switch checked={watch("promo_banner_active")} onCheckedChange={(v) => setValue("promo_banner_active", v)} />
          </div>
          <div>
            <Label>Promo Banner Text</Label>
            <Input {...register("promo_banner_text")} className="mt-1.5" placeholder="Weekend Ramen Special — 10% off!" />
          </div>
        </div>
      </section>

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
