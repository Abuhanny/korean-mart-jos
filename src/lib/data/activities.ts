import { createClient } from "@/lib/supabase/server";
import type { Activity } from "@/lib/types";

export async function getUpcomingActivities(): Promise<Activity[]> {
  const supabase = createClient();
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("is_active", true)
    .eq("status", "open")
    .gte("event_date", new Date().toISOString().slice(0, 10))
    .order("event_date", { ascending: true });

  if (!activities) return [];

  const withCounts = await Promise.all(
    activities.map(async (a) => {
      const { data: bookings } = await supabase
        .from("activity_bookings")
        .select("guests")
        .eq("activity_id", a.id)
        .in("status", ["pending", "confirmed"]);
      const booked = (bookings ?? []).reduce((sum, b) => sum + b.guests, 0);
      return { ...a, booked_count: booked, remaining: a.capacity - booked };
    })
  );

  return withCounts as Activity[];
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  const supabase = createClient();
  const { data: activity } = await supabase
    .from("activities")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (!activity) return null;

  const { data: bookings } = await supabase
    .from("activity_bookings")
    .select("guests")
    .eq("activity_id", activity.id)
    .in("status", ["pending", "confirmed"]);
  const booked = (bookings ?? []).reduce((sum, b) => sum + b.guests, 0);

  return { ...activity, booked_count: booked, remaining: activity.capacity - booked } as Activity;
}
