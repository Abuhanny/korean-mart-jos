# Korea Mart Jos — Full-Stack Web Platform

A production-ready web platform for **Korea Mart Jos**, a Korean/Asian grocery mart in Jos, Nigeria. Includes a
customer-facing storefront (shop, cart, checkout, Eat & Cook bookings, activities) and a full admin dashboard the
business owner can use without touching code.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase (Postgres + Auth).

---

## 1. What's included

**Customer site**
- Home, Shop (search/filter/sort), Product detail pages
- Cart (persisted in the browser) → Checkout → Order confirmation with live status + WhatsApp handoff
- Eat & Cook experience page with real, bookable sessions
- Activities listing + detail pages with booking
- Unified `/book` wizard (matches the "What → When → Details → Confirm" flow)
- About, Contact, sitemap.xml, robots.txt, full SEO metadata

**Admin dashboard** (`/admin`)
- Secure login (Supabase Auth), role-based access (`admin` vs `staff`)
- Dashboard overview: today's orders, pending orders/bookings, low stock, revenue
- Products, Categories, Orders, Bookings (experiences + activities combined), Experiences & Sessions,
  Activities, Promotions, Business Settings — all writing directly to the database

**Data safety**
- All prices, stock, and booking capacity are re-validated **in the database**, not trusted from the browser.
  Three Postgres functions (`place_order`, `book_experience_session`, `book_activity`) lock the relevant rows and
  check availability atomically, so two people can never book the same last seat, and nobody can manipulate a
  price by editing the client.
- Row Level Security (RLS) is enabled on every table.

---

## 2. Prerequisites

- Node.js 18.18+ (Node 20 recommended)
- A free [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account (for deployment) — optional for local dev

---

## 3. Local setup

### 3.1 Install dependencies

```bash
npm install
```

### 3.2 Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project**.
2. Once created, go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep this secret — never expose it in the browser)

### 3.3 Run the database migrations

1. In the Supabase dashboard, open **SQL Editor**.
2. Paste the entire contents of `supabase/migrations/0001_init.sql` and run it.
   This creates all tables, the booking/order functions, triggers, and RLS policies.
3. Then paste and run `supabase/migrations/0002_payments.sql`. This adds Paystack payment tracking columns to
   orders/bookings, and tightens a few lookup policies (see the comments in that file for why).

   (Alternatively, if you use the Supabase CLI: `supabase db push` runs both in order automatically.)

### 3.4 Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values from step 3.2. `NEXT_PUBLIC_SITE_URL` can stay as `http://localhost:3000` for local dev.

### 3.5 Set up Paystack (online payments)

Online payment is optional per order/booking — customers can always choose "Pay on Pickup" or "Pay at the Mart"
instead. To enable the online option:

1. Create a free account at [paystack.com](https://dashboard.paystack.com/#/signup) (Nigerian business details).
2. Go to **Settings → API Keys & Webhooks**. Copy the **Secret Key** — use the `sk_test_...` key while
   developing, and switch to `sk_live_...` only once you're ready to accept real payments.
3. Add it to `.env.local`:
   ```
   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. In the same **Webhooks** section, set the webhook URL to:
   ```
   https://your-production-domain.com/api/webhooks/paystack
   ```
   This needs a public HTTPS URL, so you can't fully set it up until you've deployed (section 5 below).
   Locally, payments still work correctly without it — after paying, the customer's browser is redirected to
   `/api/paystack/callback`, which independently re-verifies the transaction with Paystack and updates the
   order/booking. The webhook is a safety net for when a customer closes their browser before that redirect
   completes; add it once you have a live URL.
5. Test with Paystack's official test cards (only work with `sk_test_` keys) — see
   [Paystack's test payments docs](https://paystack.com/docs/payments/test-payments/) for current numbers, since
   they occasionally change.

### 3.6 Seed demo data (optional, recommended for the sales demo)

```bash
npm run seed
```

This adds ~30 demo Korean/Asian grocery products, categories, an "Eat & Cook" experience with 10 days of
sessions, 3 sample activities, and one promotion. **These are placeholder products and prices for demo purposes
only** — see section 7 for what to replace before selling/deploying.

### 3.7 Create your first admin account

```bash
npm run create-admin -- --email=you@example.com --password=YourStrongPassword123 --name="Your Name" --role=admin
```

Roles are `admin` (full access, including Settings) or `staff` (everything except Settings). Run the same
command again with a different email to create additional staff accounts.

### 3.8 Run the app

```bash
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` to sign in to the
dashboard with the account you just created.

---

## 4. Product image uploads

The brief calls for uploading product images from the admin dashboard. To keep the initial build simple and
reliable, the admin product/category/experience/activity forms currently accept an **image URL** field rather
than a raw file uploader. The recommended workflow:

1. In Supabase, go to **Storage** → create a public bucket named `product-images` (and optionally
   `activity-images`, `experience-images`).
2. Upload images there (drag and drop works in the Supabase dashboard), then copy the public URL.
3. Paste that URL into the "Image URL" field in the admin form.

This was a deliberate scope decision — wiring a full drag-and-drop uploader with client-side image validation
is a natural next increment, and the schema/UI are already built so it can be added without any data migration
(just add a `<input type="file">` component that uploads to Supabase Storage and fills the same `image_url`
field).

---

## 5. Deploying to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, click **New Project** and import the repo.
3. Add the environment variables from `.env.example` in the Vercel project settings
   (Settings → Environment Variables). Set `NEXT_PUBLIC_SITE_URL` to your production domain.
4. Deploy. Vercel will run `next build` automatically.
5. Once deployed, run the seed/create-admin scripts locally (pointed at your production Supabase project via
   `.env.local`) — these are one-off Node scripts, not part of the deployed app.

No other configuration is required — the app is fully serverless and uses Supabase for all persistence.

---

## 6. How the business owner will use the admin dashboard

Log in at `/admin/login`. The sidebar is organized exactly around daily tasks:

- **Dashboard** — a quick morning check: today's orders, anything pending, low stock alerts.
- **Products** — "add what we sell." Add/edit/delete products, change prices, mark in/out of stock, feature
  items on the homepage, flag new arrivals.
- **Categories** — organize products into sections (Ramen & Noodles, Snacks, etc.).
- **Orders** — see customer orders as they come in; update status (Pending → Confirmed → Preparing → Ready →
  Completed); message the customer directly on WhatsApp from the order page.
- **Bookings** — "see who's coming." All Eat & Cook and activity bookings in one place, with tabs for
  Pending/Confirmed/Upcoming/Completed/Cancelled. Confirm or reject pending requests with one click.
- **Experiences & Sessions** — manage "Eat & Cook" (or any similar experience) and open specific bookable time
  slots with a date, time, capacity, and price.
- **Activities** — create events (cooking classes, ramen nights, tastings, culture nights) with a date, price,
  capacity, and description.
- **Promotions** — simple banners like "Weekend Ramen Special" that can be toggled on/off.
- **Settings** — business name, phone, WhatsApp number, address, opening hours, social links, and homepage hero
  text/image. Everything else on the site reads from here — nothing is hard-coded.

No code changes are ever required for day-to-day operation.

---

## 7. What to replace before selling/deploying to the real business

Before handing this off or using it live:

1. **Run the seed script only for demos** — for the real launch, either skip `npm run seed` or delete the demo
   products/activities from the admin dashboard afterward and add the business's actual inventory, real prices,
   and real product photos.
2. **Business Settings** (`/admin/settings`) — set the real business name, phone number, **WhatsApp number**,
   address, Google Maps link, opening hours, and social media links.
3. **Homepage content** — replace the hero image with a real photo of the mart/food, and adjust the hero
   title/subtitle if desired.
4. **Eat & Cook experience** — confirm/adjust the real price, duration, and capacity, and set real upcoming
   session dates/times.
5. **Activities** — replace the 3 demo activities with real upcoming events, or delete them if none are
   scheduled yet.
6. **Admin accounts** — create real staff/admin logins for the business (`npm run create-admin`) and remove any
   test accounts.
7. **Domain** — set `NEXT_PUBLIC_SITE_URL` to the real production domain once you have one, for correct SEO
   metadata and sitemap URLs.

---

## 8. Project structure

```
src/
  app/
    (site)/          # Customer-facing pages (home, shop, cart, checkout, eat-cook, activities, book, about, contact)
    admin/
      login/         # Public login page (outside the auth guard)
      (protected)/   # Everything else under /admin — guarded by layout.tsx + middleware
    api/bookable/    # Read-only endpoint feeding the /book wizard
    sitemap.ts, robots.ts
  components/
    site/            # Navbar, Footer, ProductCard, CartProvider, WhatsApp button, etc.
    admin/           # Sidebar, form dialogs, row components for each admin resource
    ui/              # shadcn-style primitives (Button, Input, Dialog, Select, etc.)
  lib/
    supabase/        # Browser / server / service-role Supabase clients
    data/            # Server-side read functions (products, settings, experiences, activities)
    actions/         # Server Actions — all writes (checkout, booking, admin CRUD) with Zod validation
    validations/      # Zod schemas
    types.ts, utils.ts, whatsapp.ts
  middleware.ts      # Protects /admin/* routes, refreshes Supabase session
supabase/
  migrations/0001_init.sql   # Full schema, RLS policies, booking/order functions
scripts/
  seed.ts            # Demo data
  create-admin.ts    # Provision admin/staff accounts
```

---

## 9. Critical flows (already implemented and safe against tampering)

- **Product → Order**: Admin creates/edits a product → change is live on `/shop` immediately → customer adds to
  cart → checkout calls the `place_order` database function, which re-checks the product is active, in stock,
  and re-prices the order server-side → order appears in `/admin/orders`.
- **Stock**: Marking a product out of stock immediately disables "Add to Cart" on the storefront, and the
  `place_order` function refuses the order server-side even if someone bypasses the UI.
- **Capacity**: Session/activity capacity is enforced inside `book_experience_session` / `book_activity` using a
  row lock (`FOR UPDATE`) plus a live count of existing pending/confirmed bookings — two simultaneous booking
  attempts for the last seat cannot both succeed.
- **Settings propagation**: Changing the WhatsApp number or opening hours in `/admin/settings` updates every
  WhatsApp button and footer/contact page on the next page load — nothing is cached client-side.

---

## 10. Known scope decisions (intentional, per "don't over-engineer" guidance)

- Guest checkout/booking only — no customer accounts in V1 (the schema doesn't block adding this later).
- No online payment integration — orders are placed, then confirmed via WhatsApp/phone, matching the business's
  current model.
- Image uploads use a URL field backed by Supabase Storage rather than an in-app drag-and-drop uploader (see
  section 4).
- No coupon-code engine — promotions are simple display banners.

These match the brief's explicit "future-ready architecture" list — the schema and RLS design support adding
payments, accounts, and inventory quantities later without breaking changes.
