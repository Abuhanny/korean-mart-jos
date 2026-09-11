// Central type definitions mirroring the Supabase schema (supabase/migrations/0001_init.sql).
// If you use `supabase gen types typescript`, you can replace this file with the
// generated one and adjust the few hand-written helper types at the bottom.

export type UserRole = "admin" | "staff";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
export type OrderFulfillment = "pickup" | "delivery";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "rejected";
export type ActivityStatus = "open" | "closed" | "cancelled" | "completed";
export type PaymentMethod = "offline" | "online";
export type PaymentStatus = "not_required" | "pending" | "paid" | "failed";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface BusinessSettings {
  id: number;
  business_name: string;
  description: string;
  phone: string;
  whatsapp_number: string;
  email: string | null;
  address: string;
  google_maps_url: string | null;
  opening_hours: OpeningHours;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  promo_banner_text: string | null;
  promo_banner_active: boolean;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  image_url: string | null;
  gallery: string[];
  in_stock: boolean;
  stock_quantity: number | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  attributes: Record<string, string>;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfillment: OrderFulfillment;
  delivery_address: string | null;
  notes: string | null;
  status: OrderStatus;
  subtotal: number;
  total: number;
  internal_notes: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  customer_notified: boolean;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Experience {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  default_price: number;
  default_duration_minutes: number;
  default_capacity: number;
  is_active: boolean;
  is_featured: boolean;
  what_included: string[];
  what_to_know: string[];
  created_at: string;
  updated_at: string;
}

export interface ExperienceSession {
  id: string;
  experience_id: string;
  session_date: string; // yyyy-mm-dd
  start_time: string; // HH:mm:ss
  end_time: string;
  capacity: number;
  price: number;
  is_closed: boolean;
  created_at: string;
  experience?: Experience;
  booked_count?: number;
  remaining?: number;
}

export interface ExperienceBooking {
  id: string;
  booking_reference: string;
  session_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  guests: number;
  notes: string | null;
  status: BookingStatus;
  internal_notes: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  customer_notified: boolean;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
  session?: ExperienceSession;
}

export interface Activity {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price: number;
  event_date: string;
  start_time: string;
  end_time: string | null;
  capacity: number;
  location: string | null;
  what_included: string[];
  requirements: string[];
  is_active: boolean;
  is_featured: boolean;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
  booked_count?: number;
  remaining?: number;
}

export interface ActivityBooking {
  id: string;
  booking_reference: string;
  activity_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  guests: number;
  notes: string | null;
  status: BookingStatus;
  internal_notes: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  customer_notified: boolean;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
  activity?: Activity;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  discount_text: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Cart (client-side only, persisted to localStorage) ----
export interface CartItem {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  quantity: number;
}
