import { z } from "zod";

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Please enter your full name"),
  customer_phone: z.string().min(7, "Please enter a valid phone number"),
  customer_email: z.string().email("Invalid email").optional().or(z.literal("")),
  fulfillment: z.enum(["pickup", "delivery"]),
  delivery_address: z.string().optional(),
  notes: z.string().optional(),
  payment_method: z.enum(["online", "offline"]).default("offline"),
}).refine(
  (data) => data.fulfillment !== "delivery" || (data.delivery_address && data.delivery_address.length > 4),
  { message: "Delivery address is required for delivery orders", path: ["delivery_address"] }
);

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartItemInputSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});
