import { NextResponse } from "next/server";
import { getActiveExperiences, getUpcomingSessions } from "@/lib/data/experiences";
import { getUpcomingActivities } from "@/lib/data/activities";
import { getSettings } from "@/lib/data/settings";

// Read-only endpoint used by the client-side booking wizard (/book) to fetch
// what's currently bookable. All actual booking writes go through the
// bookExperienceSession/bookActivity server actions, which re-validate
// capacity in the database — this route never performs writes.
export async function GET() {
  const [experiences, sessions, activities, settings] = await Promise.all([
    getActiveExperiences(),
    getUpcomingSessions(),
    getUpcomingActivities(),
    getSettings(),
  ]);

  return NextResponse.json({ experiences, sessions, activities, whatsappNumber: settings.whatsapp_number });
}
