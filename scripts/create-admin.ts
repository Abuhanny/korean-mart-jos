/**
 * Creates (or promotes) an admin/staff user for the Korea Mart Jos admin dashboard.
 *
 * Usage:
 *   npm run create-admin -- --email=owner@example.com --password=SomeStrongPass123 --name="Business Owner" --role=admin
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { config } from "dotenv";
import { resolve } from "path";

// See note in scripts/seed.ts — dotenv doesn't know Next.js's `.env.local`
// convention on its own, so point it there explicitly.
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.join("=")];
  })
);

const email = args.email;
const password = args.password;
const name = args.name ?? "Admin";
const role = args.role === "staff" ? "staff" : "admin";

if (!email || !password) {
  console.error(
    'Usage: npm run create-admin -- --email=you@example.com --password=YourPassword123 --name="Your Name" --role=admin'
  );
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function main() {
  console.log(`Creating auth user for ${email}...`);
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let userId: string;

  if (createError) {
    if (createError.message.toLowerCase().includes("already")) {
      console.log("User already exists — looking them up to update their profile instead...");
      const { data: list, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      const existing = list.users.find((u) => u.email === email);
      if (!existing) throw new Error("Could not find existing user with that email.");
      userId = existing.id;
    } else {
      throw createError;
    }
  } else {
    userId = created.user.id;
  }

  console.log(`Upserting profile (role: ${role})...`);
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, full_name: name, role }, { onConflict: "id" });

  if (profileError) throw profileError;

  console.log(`✅ Done! ${email} can now log in at /admin/login with role "${role}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
