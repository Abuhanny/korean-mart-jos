"use client";

import { toast } from "sonner";
import { Pencil, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActivityFormDialog } from "@/components/admin/activity-form-dialog";
import { deleteActivity } from "@/lib/actions/admin-activities";
import { formatDate, formatTime, formatNaira } from "@/lib/utils";
import type { Activity } from "@/lib/types";

export function ActivityRow({ activity, bookedCount }: { activity: Activity; bookedCount: number }) {
  const remaining = activity.capacity - bookedCount;

  const onArchive = async () => {
    if (!confirm(`Remove "${activity.title}" from the public site?`)) return;
    const result = await deleteActivity(activity.id);
    if (!result.success) toast.error(result.error ?? "Failed to update");
    else toast.success("Activity archived");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 p-4">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold">{activity.title}</p>
          <Badge variant="outline" className="capitalize">{activity.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(activity.event_date)} · {formatTime(activity.start_time)} · {formatNaira(activity.price)}
        </p>
        <p className="text-xs text-muted-foreground">{bookedCount}/{activity.capacity} booked · {remaining} remaining</p>
      </div>
      <div className="flex gap-2">
        <ActivityFormDialog
          activity={activity}
          trigger={
            <button className="rounded-full p-2 hover:bg-accent" aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </button>
          }
        />
        <button onClick={onArchive} className="rounded-full p-2 hover:bg-accent" aria-label="Archive">
          <Archive className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
