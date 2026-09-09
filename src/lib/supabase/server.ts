import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Supabase client for use in Server Components, Server Actions, and
// Route Handlers. Reads the user's session from cookies so RLS policies
// (is_staff/is_admin) evaluate correctly for logged-in admins.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no `set` access — safe to
            // ignore because middleware refreshes the session on navigation.
          }
        },
      },
    }
  );
}
