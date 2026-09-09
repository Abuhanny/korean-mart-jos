import type { CartItem } from "@/lib/types";
import { formatNaira } from "@/lib/utils";

// All WhatsApp links are built from the phone number stored in
// business_settings (fetched at render time) — never hard-coded, per the
// project brief. `whatsappNumber` must be digits only (country code, no +).

function buildLink(whatsappNumber: string, message: string): string {
  const cleaned = whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

// Customer phone numbers are typically entered in local Nigerian format
// (e.g. "0801 234 5678") in checkout/booking forms. wa.me links require
// international format without a leading zero (e.g. "2348012345678").
export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  return digits;
}

export function whatsappOrderMessage(params: {
  whatsappNumber: string;
  orderNumber: string;
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
}): string {
  const { whatsappNumber, orderNumber, items, total, customerName, customerPhone } = params;
  const lines = items
    .map((i) => `${i.quantity} × ${i.name} — ${formatNaira(i.price * i.quantity)}`)
    .join("\n");

  const message = `Hello Korea Mart Jos, I just placed an order.\nOrder #${orderNumber}\n\nItems:\n${lines}\n\nTotal: ${formatNaira(
    total
  )}\n\nName: ${customerName}\nPhone: ${customerPhone}`;

  return buildLink(whatsappNumber, message);
}

export function whatsappBookingMessage(params: {
  whatsappNumber: string;
  bookingReference: string;
  title: string;
  date: string;
  time: string;
  guests: number;
  customerName: string;
  customerPhone: string;
}): string {
  const { whatsappNumber, bookingReference, title, date, time, guests, customerName, customerPhone } =
    params;
  const message = `Hello Korea Mart Jos, I just made a booking.\nBooking #${bookingReference}\n\n${title}\n${date}\n${time}\nGuests: ${guests}\n\nName: ${customerName}\nPhone: ${customerPhone}`;
  return buildLink(whatsappNumber, message);
}

export function whatsappGeneralContactLink(whatsappNumber: string, message?: string): string {
  return buildLink(
    whatsappNumber,
    message ?? "Hello Korea Mart Jos, I'd like to ask about your products/services."
  );
}

export function whatsappProductInquiryLink(whatsappNumber: string, productName: string): string {
  return buildLink(
    whatsappNumber,
    `Hello Korea Mart Jos, is "${productName}" available? I'd like to order it.`
  );
}

// For STAFF messaging a CUSTOMER (e.g. from the admin dashboard) — the
// target is the customer's own phone number, not the business's WhatsApp
// number. Mixing these up means the chat opens with the business's own
// number instead of the customer, which defeats the purpose entirely.
export function whatsappMessageToCustomer(customerPhone: string, message: string): string {
  return buildLink(normalizePhoneForWhatsApp(customerPhone), message);
}
