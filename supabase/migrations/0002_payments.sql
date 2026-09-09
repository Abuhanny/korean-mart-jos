-- =========================================================
-- Korea Mart Jos — Payments (Paystack) + RLS hardening
-- =========================================================

create type payment_method as enum ('offline', 'online');
create type payment_status as enum ('not_required', 'pending', 'paid', 'failed');

-- ---------------------------------------------------------
-- Payment columns
-- ---------------------------------------------------------
alter table orders
  add column payment_method payment_method not null default 'offline',
  add column payment_status payment_status not null default 'not_required',
  add column payment_reference text unique;

alter table experience_bookings
  add column payment_method payment_method not null default 'offline',
  add column payment_status payment_status not null default 'not_required',
  add column payment_reference text unique;

alter table activity_bookings
  add column payment_method payment_method not null default 'offline',
  add column payment_status payment_status not null default 'not_required',
  add column payment_reference text unique;

create index idx_orders_payment_ref on orders (payment_reference);
create index idx_exp_bookings_payment_ref on experience_bookings (payment_reference);
create index idx_act_bookings_payment_ref on activity_bookings (payment_reference);

-- =========================================================
-- SECURITY FIX: the original policies below used
-- `using (true)` intending "anyone who already knows the
-- order_number/booking_reference can look it up" — but RLS
-- filters rows, it doesn't know what the caller searched by.
-- `using (true)` actually allowed reading every row in the
-- table (all customer names/phones/order contents) via the
-- anon key, not just the one row a legitimate lookup wanted.
--
-- Fix: drop direct anon SELECT access to these tables, and
-- replace app-facing lookups with narrow, security-definer
-- RPCs that only ever return the single row matching an
-- exact reference/number the caller already provided.
-- =========================================================
drop policy if exists "orders: public read by number" on orders;
drop policy if exists "order_items: public read" on order_items;
drop policy if exists "exp_bookings: public read own by ref" on experience_bookings;
drop policy if exists "act_bookings: public read own by ref" on activity_bookings;

create or replace function get_order_by_number(p_order_number text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_items json;
begin
  select * into v_order from orders where order_number = p_order_number;
  if not found then
    return null;
  end if;

  select coalesce(json_agg(oi), '[]'::json) into v_items
    from order_items oi where oi.order_id = v_order.id;

  return json_build_object('order', row_to_json(v_order), 'order_items', v_items);
end;
$$;

create or replace function get_experience_booking_by_ref(p_reference text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking experience_bookings%rowtype;
  v_session experience_sessions%rowtype;
  v_experience experiences%rowtype;
begin
  select * into v_booking from experience_bookings where booking_reference = p_reference;
  if not found then
    return null;
  end if;

  select * into v_session from experience_sessions where id = v_booking.session_id;
  select * into v_experience from experiences where id = v_session.experience_id;

  return json_build_object(
    'booking', row_to_json(v_booking),
    'session', row_to_json(v_session),
    'experience', row_to_json(v_experience)
  );
end;
$$;

create or replace function get_activity_booking_by_ref(p_reference text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking activity_bookings%rowtype;
  v_activity activities%rowtype;
begin
  select * into v_booking from activity_bookings where booking_reference = p_reference;
  if not found then
    return null;
  end if;

  select * into v_activity from activities where id = v_booking.activity_id;

  return json_build_object('booking', row_to_json(v_booking), 'activity', row_to_json(v_activity));
end;
$$;

grant execute on function get_order_by_number(text) to anon, authenticated;
grant execute on function get_experience_booking_by_ref(text) to anon, authenticated;
grant execute on function get_activity_booking_by_ref(text) to anon, authenticated;

-- Note: payment writes (setting payment_reference/payment_status after
-- talking to Paystack) are performed server-side using the service-role
-- client in src/lib/actions/payments.ts and the webhook/callback route
-- handlers — never by the browser — so no new public UPDATE policy is
-- added here. Staff/admin can still see payment fields via the existing
-- "orders: staff read" / booking staff-read policies since payment_method
-- and payment_status are just additional columns on those same rows.
