"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { updateOrderStatus, updateOrderInternalNotes } from "@/lib/actions/admin-orders";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];

export function OrderStatusControls({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [current, setCurrent] = React.useState(status);
  const [pending, setPending] = React.useState(false);

  const onChange = async (value: string) => {
    setCurrent(value as OrderStatus);
    setPending(true);
    const result = await updateOrderStatus(orderId, value as OrderStatus);
    setPending(false);
    if (!result.success) {
      toast.error(result.error ?? "Failed to update status");
      setCurrent(status);
    } else {
      toast.success(`Order marked as ${value}`);
    }
  };

  return (
    <Select value={current} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OrderInternalNotes({ orderId, initialNotes }: { orderId: string; initialNotes: string | null }) {
  const [notes, setNotes] = React.useState(initialNotes ?? "");
  const [saving, setSaving] = React.useState(false);

  const onSave = async () => {
    setSaving(true);
    const result = await updateOrderInternalNotes(orderId, notes);
    setSaving(false);
    if (!result.success) toast.error(result.error ?? "Failed to save notes");
    else toast.success("Notes saved");
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Internal notes (not visible to customer)..."
        rows={3}
      />
      <Button size="sm" variant="outline" onClick={onSave} disabled={saving}>
        {saving ? "Saving..." : "Save Notes"}
      </Button>
    </div>
  );
}
