import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY client using the service role key. This bypasses RLS entirely.
// Never import this file from a Client Component, and never send this key
// to the browser. Only used for privileged operations such as the
// create-admin script and (optionally) admin storage cleanup jobs.
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
