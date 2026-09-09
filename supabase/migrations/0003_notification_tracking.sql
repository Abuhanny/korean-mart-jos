-- =========================================================
-- Korea Mart Jos — Customer notification tracking
--
-- Since notifications to customers are sent manually by staff via
-- WhatsApp (not automated), this tracks whether the customer has been
-- told about the current status. `customer_notified` starts true at
-- creation (the customer already saw a confirmation page immediately
-- after ordering/booking, so no follow-up is owed yet). Any admin-driven
-- status change flips it back to false until staff clicks the WhatsApp
-- button, which marks it true again.
-- =========================================================

alter table orders
  add column customer_notified boolean not null default true,
  add column notified_at timestamptz;

alter table experience_bookings
  add column customer_notified boolean not null default true,
  add column notified_at timestamptz;

alter table activity_bookings
  add column customer_notified boolean not null default true,
  add column notified_at timestamptz;
