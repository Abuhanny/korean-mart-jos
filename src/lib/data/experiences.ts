import { createClient } from "@/lib/supabase/server";
import type { Experience, ExperienceSession } from "@/lib/types";

export async function getActiveExperiences(): Promise<Experience[]> {
  const supabase = createClient();
  const { data } = await supabase.from("experiences").select("*").eq("is_active", true);
  return (data as Experience[]) ?? [];
}

export async function getExperienceBySlug(slug: string): Promise<Experience | null> {
  const supabase = createClient();
  const { data } = await supabase.from("experiences").select("*").eq("slug", slug).eq("is_active", true).single();
  return (data as Experience) ?? null;
}

// Returns only upcoming, open sessions with computed remaining capacity.
export async function getUpcomingSessions(experienceId?: string): Promise<ExperienceSession[]> {
  const supabase = createClient();
  let query = supabase
    .from("experience_sessions")
    .select("*, experience:experiences(*)")
    .gte("session_date", new Date().toISOString().slice(0, 10))
    .eq("is_closed", false)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (experienceId) query = query.eq("experience_id", experienceId);

  const { data: sessions } = await query;
  if (!sessions) return [];

  const withCounts = await Promise.all(
    sessions.map(async (s: any) => {
      const { data: bookings } = await supabase
        .from("experience_bookings")
        .select("guests")
        .eq("session_id", s.id)
        .in("status", ["pending", "confirmed"]);
      const booked = (bookings ?? []).reduce((sum: number, b: any) => sum + b.guests, 0);
      return { ...s, booked_count: booked, remaining: s.capacity - booked };
    })
  );

  return withCounts.filter((s) => s.remaining > 0) as ExperienceSession[];
}
