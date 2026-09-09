"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { closeSession, deleteSession } from "@/lib/actions/admin-experiences";
import { formatDate, formatTime, formatNaira } from "@/lib/utils";
import type { ExperienceSession } from "@/lib/types";

export function SessionRow({ session }: { session: ExperienceSession & { booked?: number } }) {
  const [pending, setPending] = React.useState(false);
  const booked = session.booked ?? 0;
  const remaining = session.capacity - booked;

  const toggleClosed = async (closed: boolean) => {
    setPending(true);
    const result = await closeSession(session.id, closed);
    setPending(false);
    if (!result.success) toast.error(result.error ?? "Failed to update");
  };

  const onDelete = async () => {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    const result = await deleteSession(session.id);
    if (!result.success) toast.error(result.error ?? "Failed to delete (it may already have bookings)");
    else toast.success("Session deleted");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
      <div>
        <p className="text-sm font-medium">
          {formatDate(session.session_date)} · {formatTime(session.start_time)}–{formatTime(session.end_time)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatNaira(session.price)} · {booked}/{session.capacity} booked
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={remaining > 0 ? "outline" : "destructive"}>
          {remaining > 0 ? `${remaining} left` : "Full"}
        </Badge>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Closed
          <Switch checked={session.is_closed} onCheckedChange={toggleClosed} disabled={pending} />
        </label>
        <button onClick={onDelete} className="rounded-full p-1.5 hover:bg-accent" aria-label="Delete session">
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
