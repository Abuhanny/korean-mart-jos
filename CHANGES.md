# "Needs Customer Follow-Up" Reminder Badge — What Changed

## How to apply

1. Copy all 9 code files into your project at the same paths, overwriting existing ones.
2. Run `supabase/migrations/0003_notification_tracking.sql` in your Supabase SQL Editor (after `0001_init.sql`
   and `0002_payments.sql`).
3. No new environment variables. No config changes. Just redeploy after applying.

## What it does

- Every order and booking now has a `customer_notified` flag (defaults to `true` at creation — the customer
  already saw a confirmation page immediately after ordering/booking, so nothing's owed yet).
- Whenever staff changes an order or booking's status in the admin dashboard, that flag flips to `false`.
- A small bell icon + "Needs follow-up" label appears next to that order/booking in the **Orders** list,
  **Bookings** list, and the order detail page, so nothing falls through the cracks during a busy day.
- Clicking the **WhatsApp** button on that order/booking marks it as notified again and the badge disappears.
  (We can't verify staff actually pressed send in WhatsApp, but clicking through is treated as "handled" —
  same trust level as ticking off a to-do.)

## Bug fix bundled in

While wiring this up, I found the existing "Contact on WhatsApp" buttons in the admin Orders detail page were
pointed at the **business's own WhatsApp number** instead of the customer's — meaning clicking it would have
opened a chat with yourself, not the customer. Fixed in `src/lib/whatsapp.ts` (new
`whatsappMessageToCustomer()` function, used everywhere staff needs to message a customer) and wired correctly
into both the order detail page and the (newly added) WhatsApp button on the bookings list.

## Files in this update

**New:**
- `supabase/migrations/0003_notification_tracking.sql`
- `src/lib/actions/notifications.ts`
- `src/components/admin/whatsapp-notify-button.tsx`

**Modified:**
- `src/lib/types.ts` — added `customer_notified`/`notified_at` fields
- `src/lib/whatsapp.ts` — added `whatsappMessageToCustomer()` + phone normalization; fixed the targeting bug
- `src/lib/actions/admin-orders.ts`, `src/lib/actions/admin-bookings.ts` — status updates now reset the flag
- `src/app/admin/(protected)/orders/page.tsx`, `.../orders/[id]/page.tsx`, `.../bookings/page.tsx` — show the
  badge and use the new WhatsApp button
