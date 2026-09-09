import { createClient } from "@/lib/supabase/server";
import { ActivityFormDialog } from "@/components/admin/activity-form-dialog";
import { ActivityRow } from "@/components/admin/activity-row";
import type { Activity } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminActivitiesPage() {
  const supabase = createClient();
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .order("event_date", { ascending: false });

  const withCounts = await Promise.all(
    ((activities as Activity[]) ?? []).map(async (a) => {
      const { data: bookings } = await supabase
        .from("activity_bookings")
        .select("guests")
        .eq("activity_id", a.id)
        .in("status", ["pending", "confirmed"]);
      const booked = (bookings ?? []).reduce((sum, b) => sum + b.guests, 0);
      return { activity: a, booked };
    })
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Activities</h1>
          <p className="text-sm text-muted-foreground">Create events — cooking classes, tastings, culture nights.</p>
        </div>
        <ActivityFormDialog />
      </div>

      <div className="mt-6 space-y-3">
        {withCounts.length === 0 && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No activities yet. Click "Add Activity" to create your first event.
          </p>
        )}
        {withCounts.map(({ activity, booked }) => (
          <ActivityRow key={activity.id} activity={activity} bookedCount={booked} />
        ))}
      </div>
    </div>
  );
}
