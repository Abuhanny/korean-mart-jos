"use client";

// Browser Supabase client — safe to use in Client Components.
// Uses the anon key only; RLS policies enforce what it can read/write.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
