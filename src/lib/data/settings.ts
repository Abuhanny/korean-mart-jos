import { createClient } from "@/lib/supabase/server";
import type { BusinessSettings } from "@/lib/types";

const FALLBACK: BusinessSettings = {
  id: 1,
  business_name: "Korea Mart Jos",
  description: "Korean food, groceries & experiences in Jos.",
  phone: process.env.NEXT_PUBLIC_WHATSAPP_FALLBACK ?? "2348012345678",
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_FALLBACK ?? "2348012345678",
  email: null,
  address: "Jos, Plateau State, Nigeria",
  google_maps_url: null,
  opening_hours: {
    monday: "9:00 AM - 8:00 PM",
    tuesday: "9:00 AM - 8:00 PM",
    wednesday: "9:00 AM - 8:00 PM",
    thursday: "9:00 AM - 8:00 PM",
    friday: "9:00 AM - 9:00 PM",
    saturday: "9:00 AM - 9:00 PM",
    sunday: "12:00 PM - 6:00 PM",
  },
  instagram_url: null,
  facebook_url: null,
  hero_title: "Korean food, groceries & experiences in Jos.",
  hero_subtitle:
    "Shop Korean groceries, cook and eat ramen at the mart, and join fun Korean culture activities — all in one place.",
  hero_image_url: null,
  promo_banner_text: null,
  promo_banner_active: false,
  updated_at: new Date().toISOString(),
};

export async function getSettings(): Promise<BusinessSettings> {
  const supabase = createClient();
  const { data } = await supabase.from("business_settings").select("*").eq("id", 1).single();
  return (data as BusinessSettings) ?? FALLBACK;
}
