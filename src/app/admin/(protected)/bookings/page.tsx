import Link from "next/link";
import { BellRing } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { BookingActions } from "@/components/admin/booking-actions";
import { WhatsAppNotifyButton } from "@/components/admin/whatsapp-notify-button";
import { whatsappMessageToCustomer } from "@/lib/whatsapp";
import { formatDate, formatTime, cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_VARIANT: Record<BookingStatus, "default" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  confirmed: "default",
  completed: "success",
  cancelled: "destructive",
  rejected: "destructive",
};

interface UnifiedBooking {
  id: string;
  kind: "experience" | "activity";
  reference: string;
  title: string;
  date: string;
  time: string;
  customer_name: string;
  customer_phone: string;
  guests: number;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  payment_method: "offline" | "online";
  payment_status: "not_required" | "pending" | "paid" | "failed";
  customer_notified: boolean;
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = createClient();
  const tab = searchParams.tab ?? "all";
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: expBookings }, { data: actBookings }] = await Promise.all([
    supabase.from("experience_bookings").select("*, session:experience_sessions(*, experience:experiences(name))").order("created_at", { ascending: false }),
    supabase.from("activity_bookings").select("*, activity:activities(title, event_date, start_time)").order("created_at", { ascending: false }),
  ]);

  const unified: UnifiedBooking[] = [
    ...(expBookings ?? []).map((b: any) => ({
      id: b.id,
      kind: "experience" as const,
      reference: b.booking_reference,
      title: b.session?.experience?.name ?? "Eat & Cook",
      date: b.session?.session_date,
      time: `${formatTime(b.session?.start_time ?? "00:00:00")} – ${formatTime(b.session?.end_time ?? "00:00:00")}`,
      customer_name: b.customer_name,
      customer_phone: b.customer_phone,
      guests: b.guests,
      status: b.status,
      notes: b.notes,
      created_at: b.created_at,
      payment_method: b.payment_method,
      payment_status: b.payment_status,
      customer_notified: b.customer_notified,
    })),
    ...(actBookings ?? []).map((b: any) => ({
      id: b.id,
      kind: "activity" as const,
      reference: b.booking_reference,
      title: b.activity?.title ?? "Activity",
      date: b.activity?.event_date,
      time: formatTime(b.activity?.start_time ?? "00:00:00"),
      customer_name: b.customer_name,
      customer_phone: b.customer_phone,
      guests: b.guests,
      status: b.status,
      notes: b.notes,
      created_at: b.created_at,
      payment_method: b.payment_method,
      payment_status: b.payment_status,
      customer_notified: b.customer_notified,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filtered = unified.filter((b) => {
    if (tab === "all") return true;
    if (tab === "upcoming") return b.date >= today && (b.status === "confirmed" || b.status === "pending");
    return b.status === tab;
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Bookings</h1>
      <p className="text-sm text-muted-foreground">Eat & Cook sessions and activity bookings, all in one place.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "all" ? "/admin/bookings" : `/admin/bookings?tab=${t.value}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              tab === t.value ? "bg-primary text-primary-foreground" : "border-border hover:bg-accent"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No bookings in this view.
          </p>
        )}
        {filtered.map((b) => {
          const waLink = whatsappMessageToCustomer(
            b.customer_phone,
            `Hello ${b.customer_name}, this is Korea Mart Jos regarding your booking ${b.reference} (${b.title}). Your booking is now "${b.status}".`
          );
          return (
            <div key={`${b.kind}-${b.id}`} className="rounded-2xl border border-border/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{b.reference}</span>
                    <Badge variant="outline" className="capitalize">{b.kind}</Badge>
                    <Badge variant={STATUS_VARIANT[b.status]} className="capitalize">{b.status}</Badge>
                    {!b.customer_notified && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                        <BellRing className="h-3.5 w-3.5" /> Needs follow-up
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-semibold">{b.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.date ? formatDate(b.date) : ""} · {b.time} · {b.guests} guest{b.guests > 1 ? "s" : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{b.customer_name} · {b.customer_phone}</p>
                  {b.payment_method === "online" && (
                    <Badge
                      variant={b.payment_status === "paid" ? "success" : b.payment_status === "failed" ? "destructive" : "warning"}
                      className="mt-1 capitalize"
                    >
                      {b.payment_status} (online)
                    </Badge>
                  )}
                  {b.notes && <p className="mt-1 text-sm italic text-muted-foreground">"{b.notes}"</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <BookingActions id={b.id} kind={b.kind} status={b.status} />
                  <WhatsAppNotifyButton href={waLink} kind={b.kind} id={b.id} label="WhatsApp" size="sm" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
