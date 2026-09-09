"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateExperienceBookingStatus, updateActivityBookingStatus } from "@/lib/actions/admin-bookings";
import type { BookingStatus } from "@/lib/types";

export function BookingActions({
  id,
  kind,
  status,
}: {
  id: string;
  kind: "experience" | "activity";
  status: BookingStatus;
}) {
  const [pending, setPending] = React.useState(false);

  const act = async (newStatus: BookingStatus) => {
    setPending(true);
    const result =
      kind === "experience"
        ? await updateExperienceBookingStatus(id, newStatus)
        : await updateActivityBookingStatus(id, newStatus);
    setPending(false);
    if (!result.success) toast.error(result.error ?? "Failed to update booking");
    else toast.success(`Booking ${newStatus}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status === "pending" && (
        <>
          <Button size="sm" onClick={() => act("confirmed")} disabled={pending}>Confirm</Button>
          <Button size="sm" variant="outline" onClick={() => act("rejected")} disabled={pending}>Reject</Button>
        </>
      )}
      {status === "confirmed" && (
        <>
          <Button size="sm" onClick={() => act("completed")} disabled={pending}>Mark Completed</Button>
          <Button size="sm" variant="outline" onClick={() => act("cancelled")} disabled={pending}>Cancel</Button>
        </>
      )}
      {(status === "completed" || status === "cancelled" || status === "rejected") && (
        <span className="text-xs text-muted-foreground capitalize">{status}</span>
      )}
    </div>
  );
}
