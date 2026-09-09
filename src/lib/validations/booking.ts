import { z } from "zod";

export const bookingDetailsSchema = z.object({
  customer_name: z.string().min(2, "Please enter your full name"),
  customer_phone: z.string().min(7, "Please enter a valid phone number"),
  customer_email: z.string().email("Invalid email").optional().or(z.literal("")),
  guests: z.number().int().min(1, "At least 1 guest").max(20, "Max 20 guests per booking"),
  notes: z.string().optional(),
  payment_method: z.enum(["online", "offline"]).default("offline"),
});

export type BookingDetailsInput = z.infer<typeof bookingDetailsSchema>;

export const sessionBookingSchema = bookingDetailsSchema.extend({
  session_id: z.string().uuid(),
});

export const activityBookingSchema = bookingDetailsSchema.extend({
  activity_id: z.string().uuid(),
});
