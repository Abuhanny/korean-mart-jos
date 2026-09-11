import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  compare_at_price: z.coerce.number().min(0).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  sku: z.string().optional(),
  image_url: z.string().optional().nullable(),
  in_stock: z.boolean().default(true),
  stock_quantity: z.coerce.number().int().min(0).optional().nullable(),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_active: z.boolean().default(true),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image_url: z.string().optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const experienceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image_url: z.string().optional().nullable(),
  default_price: z.coerce.number().min(0),
  default_duration_minutes: z.coerce.number().int().min(15),
  default_capacity: z.coerce.number().int().min(1),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});
export type ExperienceInput = z.infer<typeof experienceSchema>;

export const sessionSchema = z.object({
  experience_id: z.string().uuid(),
  session_date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  capacity: z.coerce.number().int().min(1),
  price: z.coerce.number().min(0),
});
export type SessionInput = z.infer<typeof sessionSchema>;

export const activitySchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image_url: z.string().optional().nullable(),
  price: z.coerce.number().min(0),
  event_date: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().optional().nullable(),
  capacity: z.coerce.number().int().min(1),
  location: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  status: z.enum(["open", "closed", "cancelled", "completed"]).default("open"),
});
export type ActivityInput = z.infer<typeof activitySchema>;

export const settingsSchema = z.object({
  business_name: z.string().min(2),
  description: z.string().optional(),
  phone: z.string().min(7),
  whatsapp_number: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(3),
  google_maps_url: z.string().url().optional().or(z.literal("")),
  instagram_url: z.string().url().optional().or(z.literal("")),
  facebook_url: z.string().url().optional().or(z.literal("")),
  tiktok_url: z.string().url().optional().or(z.literal("")),
  youtube_url: z.string().url().optional().or(z.literal("")),
  twitter_url: z.string().url().optional().or(z.literal("")),
  hero_title: z.string().min(2),
  hero_subtitle: z.string().optional(),
  hero_image_url: z.string().optional().nullable(),
  promo_banner_text: z.string().optional(),
  promo_banner_active: z.boolean().default(false),
  opening_hours: z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string(),
  }),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const promotionSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  image_url: z.string().optional().nullable(),
  discount_text: z.string().optional(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});
export type PromotionInput = z.infer<typeof promotionSchema>;
