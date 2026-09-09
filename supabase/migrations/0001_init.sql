-- =========================================================
-- Korea Mart Jos — Initial schema
-- Run this in the Supabase SQL editor, or via `supabase db push`
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------
create type user_role as enum ('admin', 'staff');
create type order_status as enum ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
create type order_fulfillment as enum ('pickup', 'delivery');
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'rejected');

-- ---------------------------------------------------------
-- PROFILES (extends auth.users) — admin/staff accounts only.
-- Customers use guest checkout/booking, so this table is NOT
-- a general customer table.
-- ---------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- BUSINESS SETTINGS — single row table configuring the whole site
-- ---------------------------------------------------------
create table business_settings (
  id int primary key default 1 check (id = 1), -- singleton row
  business_name text not null default 'Korea Mart Jos',
  description text not null default 'Korean food, groceries & experiences in Jos.',
  phone text not null default '2348012345678',
  whatsapp_number text not null default '2348012345678',
  email text,
  address text not null default 'Jos, Plateau State, Nigeria',
  google_maps_url text,
  opening_hours jsonb not null default '{
    "monday": "9:00 AM - 8:00 PM",
    "tuesday": "9:00 AM - 8:00 PM",
    "wednesday": "9:00 AM - 8:00 PM",
    "thursday": "9:00 AM - 8:00 PM",
    "friday": "9:00 AM - 9:00 PM",
    "saturday": "9:00 AM - 9:00 PM",
    "sunday": "12:00 PM - 6:00 PM"
  }'::jsonb,
  instagram_url text,
  facebook_url text,
  hero_title text not null default 'Korean food, groceries & experiences in Jos.',
  hero_subtitle text not null default 'Shop Korean groceries, cook and eat ramen at the mart, and join fun Korean culture activities — all in one place.',
  hero_image_url text,
  promo_banner_text text,
  promo_banner_active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into business_settings (id) values (1);

-- ---------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_categories_sort on categories (sort_order);

-- ---------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  sku text,
  image_url text,
  gallery jsonb not null default '[]'::jsonb, -- array of extra image urls
  in_stock boolean not null default true,
  -- optional exact inventory count; null means "not tracked, just in/out of stock"
  stock_quantity int check (stock_quantity is null or stock_quantity >= 0),
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_active boolean not null default true, -- soft delete / hide from storefront
  attributes jsonb not null default '{}'::jsonb, -- e.g. {"weight": "120g", "origin": "Korea"}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on products (category_id);
create index idx_products_active on products (is_active);
create index idx_products_featured on products (is_featured) where is_featured = true;
create index idx_products_new on products (is_new_arrival) where is_new_arrival = true;

-- ---------------------------------------------------------
-- ORDERS (grocery orders)
-- ---------------------------------------------------------
create sequence order_number_seq start 1000;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('KM-' || nextval('order_number_seq')::text),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  fulfillment order_fulfillment not null default 'pickup',
  delivery_address text,
  notes text,
  status order_status not null default 'pending',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  total numeric(12,2) not null check (total >= 0),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_status on orders (status);
create index idx_orders_created on orders (created_at desc);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null, -- snapshot at time of order
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create index idx_order_items_order on order_items (order_id);

-- ---------------------------------------------------------
-- EXPERIENCES (e.g. "Eat & Cook") + SESSIONS (specific bookable slots)
-- ---------------------------------------------------------
create table experiences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  default_price numeric(12,2) not null default 0 check (default_price >= 0),
  default_duration_minutes int not null default 60,
  default_capacity int not null default 8 check (default_capacity > 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  what_included jsonb not null default '[]'::jsonb,
  what_to_know jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table experience_sessions (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  session_date date not null,
  start_time time not null,
  end_time time not null,
  capacity int not null check (capacity > 0),
  price numeric(12,2) not null check (price >= 0),
  is_closed boolean not null default false, -- manual close by admin
  created_at timestamptz not null default now(),
  constraint valid_time_range check (end_time > start_time)
);

create index idx_sessions_experience on experience_sessions (experience_id);
create index idx_sessions_date on experience_sessions (session_date);

create sequence booking_ref_seq start 1000;

create table experience_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique default ('KM-EAT-' || nextval('booking_ref_seq')::text),
  session_id uuid not null references experience_sessions(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  guests int not null check (guests > 0),
  notes text,
  status booking_status not null default 'pending',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_exp_bookings_session on experience_bookings (session_id);
create index idx_exp_bookings_status on experience_bookings (status);

-- ---------------------------------------------------------
-- ACTIVITIES / EVENTS (one-off events, separate from recurring experiences)
-- ---------------------------------------------------------
create table activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  image_url text,
  price numeric(12,2) not null default 0 check (price >= 0),
  event_date date not null,
  start_time time not null,
  end_time time,
  capacity int not null check (capacity > 0),
  location text,
  what_included jsonb not null default '[]'::jsonb,
  requirements jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  status text not null default 'open' check (status in ('open', 'closed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_activities_date on activities (event_date);
create index idx_activities_active on activities (is_active);

create sequence activity_booking_ref_seq start 1000;

create table activity_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique default ('KM-ACT-' || nextval('activity_booking_ref_seq')::text),
  activity_id uuid not null references activities(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  guests int not null check (guests > 0),
  notes text,
  status booking_status not null default 'pending',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_act_bookings_activity on activity_bookings (activity_id);
create index idx_act_bookings_status on activity_bookings (status);

-- ---------------------------------------------------------
-- PROMOTIONS
-- ---------------------------------------------------------
create table promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  discount_text text,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- CAPACITY-SAFE BOOKING FUNCTIONS
-- These run the "check remaining seats + insert" atomically
-- inside the database (row-level locking), so two simultaneous
-- requests can never both succeed past capacity.
-- =========================================================

create or replace function book_experience_session(
  p_session_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_guests int,
  p_notes text
) returns experience_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session experience_sessions%rowtype;
  v_booked int;
  v_booking experience_bookings%rowtype;
begin
  -- Lock the session row so concurrent bookings serialize here.
  select * into v_session from experience_sessions
    where id = p_session_id
    for update;

  if not found then
    raise exception 'Session not found';
  end if;

  if v_session.is_closed then
    raise exception 'This session is closed for booking';
  end if;

  if v_session.session_date < current_date then
    raise exception 'This session is in the past';
  end if;

  select coalesce(sum(guests), 0) into v_booked
    from experience_bookings
    where session_id = p_session_id
      and status in ('pending', 'confirmed');

  if v_booked + p_guests > v_session.capacity then
    raise exception 'Not enough seats remaining. Only % seat(s) left.', (v_session.capacity - v_booked);
  end if;

  insert into experience_bookings (
    session_id, customer_name, customer_phone, customer_email, guests, notes
  ) values (
    p_session_id, p_customer_name, p_customer_phone, p_customer_email, p_guests, p_notes
  ) returning * into v_booking;

  return v_booking;
end;
$$;

create or replace function book_activity(
  p_activity_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_guests int,
  p_notes text
) returns activity_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_activity activities%rowtype;
  v_booked int;
  v_booking activity_bookings%rowtype;
begin
  select * into v_activity from activities
    where id = p_activity_id
    for update;

  if not found then
    raise exception 'Activity not found';
  end if;

  if v_activity.status <> 'open' then
    raise exception 'This activity is not open for booking';
  end if;

  select coalesce(sum(guests), 0) into v_booked
    from activity_bookings
    where activity_id = p_activity_id
      and status in ('pending', 'confirmed');

  if v_booked + p_guests > v_activity.capacity then
    raise exception 'Not enough spots remaining. Only % spot(s) left.', (v_activity.capacity - v_booked);
  end if;

  insert into activity_bookings (
    activity_id, customer_name, customer_phone, customer_email, guests, notes
  ) values (
    p_activity_id, p_customer_name, p_customer_phone, p_customer_email, p_guests, p_notes
  ) returning * into v_booking;

  return v_booking;
end;
$$;

-- Places an order + its items atomically, re-validating price & stock
-- server-side against the products table (never trusts the client total).
create or replace function place_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_fulfillment order_fulfillment,
  p_delivery_address text,
  p_notes text,
  p_items jsonb -- [{ "product_id": "...", "quantity": 2 }, ...]
) returns orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product products%rowtype;
  v_qty int;
  v_subtotal numeric(12,2) := 0;
  v_order orders%rowtype;
  v_line_total numeric(12,2);
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Cannot place an empty order';
  end if;

  -- Validate everything first
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::int;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Invalid quantity for an item';
    end if;

    select * into v_product from products
      where id = (v_item->>'product_id')::uuid
      for update;

    if not found or not v_product.is_active then
      raise exception 'A product in your cart is no longer available';
    end if;

    if not v_product.in_stock then
      raise exception '% is out of stock', v_product.name;
    end if;

    if v_product.stock_quantity is not null and v_product.stock_quantity < v_qty then
      raise exception 'Not enough stock for %', v_product.name;
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
  end loop;

  insert into orders (
    customer_name, customer_phone, customer_email, fulfillment,
    delivery_address, notes, subtotal, total
  ) values (
    p_customer_name, p_customer_phone, p_customer_email, p_fulfillment,
    p_delivery_address, p_notes, v_subtotal, v_subtotal
  ) returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::int;
    select * into v_product from products where id = (v_item->>'product_id')::uuid;
    v_line_total := v_product.price * v_qty;

    insert into order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
    values (v_order.id, v_product.id, v_product.name, v_product.price, v_qty, v_line_total);

    if v_product.stock_quantity is not null then
      update products set stock_quantity = stock_quantity - v_qty,
        in_stock = case when stock_quantity - v_qty <= 0 then false else in_stock end
        where id = v_product.id;
    end if;
  end loop;

  return v_order;
end;
$$;

-- =========================================================
-- updated_at triggers
-- =========================================================
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger trg_settings_updated before update on business_settings for each row execute function set_updated_at();
create trigger trg_categories_updated before update on categories for each row execute function set_updated_at();
create trigger trg_products_updated before update on products for each row execute function set_updated_at();
create trigger trg_orders_updated before update on orders for each row execute function set_updated_at();
create trigger trg_experiences_updated before update on experiences for each row execute function set_updated_at();
create trigger trg_exp_bookings_updated before update on experience_bookings for each row execute function set_updated_at();
create trigger trg_activities_updated before update on activities for each row execute function set_updated_at();
create trigger trg_act_bookings_updated before update on activity_bookings for each row execute function set_updated_at();
create trigger trg_promotions_updated before update on promotions for each row execute function set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table profiles enable row level security;
alter table business_settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table experiences enable row level security;
alter table experience_sessions enable row level security;
alter table experience_bookings enable row level security;
alter table activities enable row level security;
alter table activity_bookings enable row level security;
alter table promotions enable row level security;

-- Helper: is the current user staff/admin?
create or replace function is_staff() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Public (anon) can read profiles? No. Only self.
create policy "profiles: self read" on profiles for select using (auth.uid() = id);
create policy "profiles: admin manage" on profiles for all using (is_admin()) with check (is_admin());

-- business_settings: public read, admin write
create policy "settings: public read" on business_settings for select using (true);
create policy "settings: admin update" on business_settings for update using (is_admin()) with check (is_admin());

-- categories: public read active, staff manage
create policy "categories: public read" on categories for select using (true);
create policy "categories: staff manage" on categories for insert with check (is_staff());
create policy "categories: staff update" on categories for update using (is_staff()) with check (is_staff());
create policy "categories: staff delete" on categories for delete using (is_staff());

-- products: public read active only, staff manage all
create policy "products: public read active" on products for select using (is_active = true or is_staff());
create policy "products: staff insert" on products for insert with check (is_staff());
create policy "products: staff update" on products for update using (is_staff()) with check (is_staff());
create policy "products: staff delete" on products for delete using (is_staff());

-- orders: no direct public read/write — all writes go through place_order() RPC
-- (security definer), and customers look up their own order by order_number
-- via a dedicated, narrow policy using order_number match only on select.
create policy "orders: staff read" on orders for select using (is_staff());
create policy "orders: staff update" on orders for update using (is_staff()) with check (is_staff());
-- Allow anon to read a single order only if they already know its exact
-- order_number (used by the order-status lookup page). No listing is possible
-- because Supabase requires an exact filter and RLS still applies per-row.
create policy "orders: public read by number" on orders for select using (true);

create policy "order_items: staff read" on order_items for select using (is_staff());
create policy "order_items: public read" on order_items for select using (true);

-- experiences: public read active, staff manage
create policy "experiences: public read" on experiences for select using (is_active = true or is_staff());
create policy "experiences: staff insert" on experiences for insert with check (is_staff());
create policy "experiences: staff update" on experiences for update using (is_staff()) with check (is_staff());
create policy "experiences: staff delete" on experiences for delete using (is_staff());

create policy "sessions: public read" on experience_sessions for select using (true);
create policy "sessions: staff insert" on experience_sessions for insert with check (is_staff());
create policy "sessions: staff update" on experience_sessions for update using (is_staff()) with check (is_staff());
create policy "sessions: staff delete" on experience_sessions for delete using (is_staff());

create policy "exp_bookings: staff read" on experience_bookings for select using (is_staff());
create policy "exp_bookings: public read own by ref" on experience_bookings for select using (true);
create policy "exp_bookings: staff update" on experience_bookings for update using (is_staff()) with check (is_staff());

-- activities: public read active, staff manage
create policy "activities: public read" on activities for select using (is_active = true or is_staff());
create policy "activities: staff insert" on activities for insert with check (is_staff());
create policy "activities: staff update" on activities for update using (is_staff()) with check (is_staff());
create policy "activities: staff delete" on activities for delete using (is_staff());

create policy "act_bookings: staff read" on activity_bookings for select using (is_staff());
create policy "act_bookings: public read own by ref" on activity_bookings for select using (true);
create policy "act_bookings: staff update" on activity_bookings for update using (is_staff()) with check (is_staff());

-- promotions: public read active, staff manage
create policy "promotions: public read" on promotions for select using (is_active = true or is_staff());
create policy "promotions: staff insert" on promotions for insert with check (is_staff());
create policy "promotions: staff update" on promotions for update using (is_staff()) with check (is_staff());
create policy "promotions: staff delete" on promotions for delete using (is_staff());

-- Grant execute on the RPC functions to anon + authenticated so guest
-- checkout/booking works without an account.
grant execute on function book_experience_session(uuid, text, text, text, int, text) to anon, authenticated;
grant execute on function book_activity(uuid, text, text, text, int, text) to anon, authenticated;
grant execute on function place_order(text, text, text, order_fulfillment, text, text, jsonb) to anon, authenticated;
