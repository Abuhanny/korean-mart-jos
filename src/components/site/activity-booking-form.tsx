"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingDetailsSchema, type BookingDetailsInput } from "@/lib/validations/booking";
import { bookActivity } from "@/lib/actions/bookings";
import { whatsappBookingMessage } from "@/lib/whatsapp";
import { formatDate, formatTime, formatNaira, cn } from "@/lib/utils";
import type { Activity } from "@/lib/types";

export function ActivityBookingForm({
  activity,
  whatsappNumber,
  paystackEnabled,
}: {
  activity: Activity;
  whatsappNumber: string;
  paystackEnabled: boolean;
}) {
  const [reference, setReference] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const remaining = activity.remaining ?? activity.capacity;
  const full = remaining <= 0;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingDetailsInput>({
    resolver: zodResolver(bookingDetailsSchema),
    defaultValues: { guests: 1, payment_method: "offline" },
  });

  const guests = watch("guests") || 1;
  const customerName = watch("customer_name") || "";
  const customerPhone = watch("customer_phone") || "";
  const paymentMethod = watch("payment_method");

  const onSubmit = async (values: BookingDetailsInput) => {
    setSubmitting(true);
    const result = await bookActivity({ ...values, activity_id: activity.id });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error ?? "Could not complete booking");
      return;
    }

    if (result.authorizationUrl) {
      window.location.href = result.authorizationUrl;
      return;
    }

    if (result.paymentError) {
      toast.error("Booking made, but online payment couldn't start. You can pay at the event or retry from your booking page.");
    }

    setReference(result.bookingReference!);
  };

  if (reference) {
    const waLink = whatsappBookingMessage({
      whatsappNumber,
      bookingReference: reference,
      title: activity.title,
      date: formatDate(activity.event_date),
      time: formatTime(activity.start_time),
      guests,
      customerName,
      customerPhone,
    });
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h3 className="font-display text-xl font-bold text-emerald-900">Booking Request Sent!</h3>
        <p className="mt-2 text-sm text-emerald-800">
          Reference: <span className="font-mono font-semibold">{reference}</span>
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          We'll confirm your spot shortly. Status: <strong>Pending Confirmation</strong>
        </p>
        <Button asChild variant="whatsapp" className="mt-4">
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            Notify us on WhatsApp
          </a>
        </Button>
        <p className="mt-3">
          <Link href={`/booking/${reference}`} className="text-sm font-medium text-primary hover:underline">
            View your booking →
          </Link>
        </p>
      </div>
    );
  }

  if (full) {
    return (
      <div className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
        This activity is fully booked. Check back later or contact us on WhatsApp for the waitlist.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-border/60 p-6">
      <h3 className="font-semibold">Reserve your spot</h3>
      <div>
        <Label htmlFor="customer_name">Full Name</Label>
        <Input id="customer_name" {...register("customer_name")} className="mt-1.5" />
        {errors.customer_name && <p className="mt-1 text-sm text-destructive">{errors.customer_name.message}</p>}
      </div>
      <div>
        <Label htmlFor="customer_phone">Phone Number</Label>
        <Input id="customer_phone" {...register("customer_phone")} className="mt-1.5" />
        {errors.customer_phone && <p className="mt-1 text-sm text-destructive">{errors.customer_phone.message}</p>}
      </div>
      <div>
        <Label htmlFor="customer_email">Email (optional)</Label>
        <Input id="customer_email" type="email" {...register("customer_email")} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="guests">Number of Guests</Label>
        <Input
          id="guests"
          type="number"
          min={1}
          max={remaining}
          {...register("guests", { valueAsNumber: true })}
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-muted-foreground">{remaining} spot(s) remaining</p>
        {errors.guests && <p className="mt-1 text-sm text-destructive">{errors.guests.message}</p>}
      </div>
      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" {...register("notes")} className="mt-1.5" />
      </div>

      {paystackEnabled && (
        <div>
          <Label>Payment</Label>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            {(
              [
                { value: "offline", label: "Pay at the Event" },
                { value: "online", label: "Pay Online Now" },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center justify-center rounded-xl border py-3 text-center text-sm font-medium",
                  paymentMethod === opt.value ? "border-primary bg-primary/10 text-primary" : "border-input"
                )}
              >
                <input type="radio" value={opt.value} {...register("payment_method")} className="sr-only" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3 text-sm font-medium">
        <span>Estimated total</span>
        <span>{formatNaira(activity.price * guests)}</span>
      </div>
      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? "Submitting..." : "Booking Request"}
      </Button>
    </form>
  );
}
