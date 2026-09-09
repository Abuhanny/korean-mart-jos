"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChefHat, PartyPopper, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingDetailsSchema, type BookingDetailsInput } from "@/lib/validations/booking";
import { bookExperienceSession, bookActivity } from "@/lib/actions/bookings";
import { whatsappBookingMessage } from "@/lib/whatsapp";
import { formatDate, formatTime, formatNaira, cn } from "@/lib/utils";
import type { Experience, ExperienceSession, Activity } from "@/lib/types";

type BookableData = {
  experiences: Experience[];
  sessions: ExperienceSession[];
  activities: Activity[];
  whatsappNumber: string;
};
type Mode = "experience" | "activity";

const STEPS = ["What", "When", "Details", "Confirm"];

export default function BookingWizard({ paystackEnabled }: { paystackEnabled: boolean }) {
  const searchParams = useSearchParams();
  const [data, setData] = React.useState<BookableData | null>(null);
  const [step, setStep] = React.useState(0);
  const [mode, setMode] = React.useState<Mode | null>(null);
  const [selectedExperience, setSelectedExperience] = React.useState<Experience | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedSession, setSelectedSession] = React.useState<ExperienceSession | null>(null);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const [whatsappNumber, setWhatsappNumber] = React.useState("2348012345678");
  const [reference, setReference] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/bookable")
      .then((r) => r.json())
      .then((d: BookableData) => {
        setData(d);
        setWhatsappNumber(d.whatsappNumber);
        const expSlug = searchParams.get("experience");
        const sessionId = searchParams.get("session");
        if (expSlug) {
          const exp = d.experiences.find((e) => e.slug === expSlug);
          if (exp) {
            setMode("experience");
            setSelectedExperience(exp);
            if (sessionId) {
              const s = d.sessions.find((s) => s.id === sessionId);
              if (s) {
                setSelectedDate(s.session_date);
                setSelectedSession(s);
                setStep(2);
              } else {
                setStep(1);
              }
            } else {
              setStep(1);
            }
          }
        }
      });
  }, [searchParams]);

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

  if (!data) {
    return <div className="container section text-center text-muted-foreground">Loading booking options...</div>;
  }

  const availableDates =
    mode === "experience" && selectedExperience
      ? Array.from(
          new Set(
            data.sessions
              .filter((s) => s.experience_id === selectedExperience.id)
              .map((s) => s.session_date)
          )
        ).sort()
      : [];

  const sessionsForDate =
    mode === "experience" && selectedExperience && selectedDate
      ? data.sessions.filter((s) => s.experience_id === selectedExperience.id && s.session_date === selectedDate)
      : [];

  const maxGuests =
    mode === "experience" ? selectedSession?.remaining ?? 1 : selectedActivity?.remaining ?? 1;
  const unitPrice = mode === "experience" ? selectedSession?.price ?? 0 : selectedActivity?.price ?? 0;
  const title = mode === "experience" ? selectedExperience?.name ?? "" : selectedActivity?.title ?? "";
  const dateLabel =
    mode === "experience" && selectedSession
      ? `${formatDate(selectedSession.session_date)}, ${formatTime(selectedSession.start_time)} – ${formatTime(selectedSession.end_time)}`
      : mode === "activity" && selectedActivity
      ? `${formatDate(selectedActivity.event_date)}, ${formatTime(selectedActivity.start_time)}`
      : "";

  const onSubmit = async (values: BookingDetailsInput) => {
    setSubmitting(true);
    const result =
      mode === "experience" && selectedSession
        ? await bookExperienceSession({ ...values, session_id: selectedSession.id })
        : selectedActivity
        ? await bookActivity({ ...values, activity_id: selectedActivity.id })
        : { success: false, error: "Nothing selected" };

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
      toast.error("Booking made, but online payment couldn't start. You can pay at the mart or retry from your booking page.");
    }

    setReference(result.bookingReference!);
    setStep(3);
  };

  if (reference) {
    const waLink = whatsappBookingMessage({
      whatsappNumber,
      bookingReference: reference,
      title,
      date: dateLabel,
      time: "",
      guests,
      customerName,
      customerPhone,
    });
    return (
      <div className="container section max-w-lg text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        <h1 className="mt-4 font-display text-3xl font-bold">Booking Request Sent!</h1>
        <p className="mt-2 text-muted-foreground">
          Reference: <span className="font-mono font-semibold text-foreground">{reference}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your booking is <strong>pending confirmation</strong>. We'll reach out shortly to confirm.
        </p>
        <Button asChild variant="whatsapp" size="lg" className="mt-6">
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            Notify us on WhatsApp
          </a>
        </Button>
        <p className="mt-4">
          <Link href={`/booking/${reference}`} className="text-sm font-medium text-primary hover:underline">
            View your booking →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container section max-w-2xl">
      <h1 className="mb-2 font-display text-3xl font-bold">Book a Visit</h1>
      <Stepper current={step} />

      {/* STEP 0: WHAT */}
      {step === 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="font-semibold">What would you like to do?</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.experiences.map((exp) => (
              <button
                key={exp.id}
                onClick={() => {
                  setMode("experience");
                  setSelectedExperience(exp);
                  setStep(1);
                }}
                className="flex flex-col items-start gap-2 rounded-2xl border border-border/60 p-5 text-left hover:border-primary hover:bg-primary/5"
              >
                <ChefHat className="h-6 w-6 text-primary" />
                <span className="font-semibold">{exp.name}</span>
                <span className="text-sm text-muted-foreground">From {formatNaira(exp.default_price)}</span>
              </button>
            ))}
            {data.activities.map((act) => (
              <button
                key={act.id}
                onClick={() => {
                  setMode("activity");
                  setSelectedActivity(act);
                  setStep(2); // activities: date/time fixed, skip straight to guest count
                }}
                disabled={(act.remaining ?? 0) <= 0}
                className="flex flex-col items-start gap-2 rounded-2xl border border-border/60 p-5 text-left hover:border-primary hover:bg-primary/5 disabled:opacity-40"
              >
                <PartyPopper className="h-6 w-6 text-secondary" />
                <span className="font-semibold">{act.title}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(act.event_date)} · {(act.remaining ?? 0) > 0 ? `${act.remaining} spots left` : "Fully booked"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: WHEN (date, then session) — experiences only */}
      {step === 1 && mode === "experience" && (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="mb-3 font-semibold">Choose a date</h2>
            {availableDates.length === 0 ? (
              <p className="text-muted-foreground">No available dates right now for this experience.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableDates.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDate(d);
                      setSelectedSession(null);
                    }}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm",
                      selectedDate === d ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"
                    )}
                  >
                    {formatDate(d)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedDate && (
            <div>
              <h2 className="mb-3 font-semibold">Choose a session</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {sessionsForDate.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSession(s)}
                    className={cn(
                      "rounded-2xl border p-4 text-left",
                      selectedSession?.id === s.id ? "border-primary bg-primary/5" : "border-border/60 hover:bg-accent"
                    )}
                  >
                    <p className="font-medium">
                      {formatTime(s.start_time)} – {formatTime(s.end_time)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatNaira(s.price)} · {s.remaining} spots remaining
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
            <Button disabled={!selectedSession} onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      )}

      {/* STEP 2: DETAILS */}
      {step === 2 && (mode === "experience" ? selectedSession : selectedActivity) && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div className="rounded-2xl bg-accent/50 p-4 text-sm">
            <p className="font-semibold">{title}</p>
            <p className="text-muted-foreground">{dateLabel}</p>
          </div>

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
            <Label htmlFor="guests">Number of People</Label>
            <Input id="guests" type="number" min={1} max={maxGuests} {...register("guests", { valueAsNumber: true })} className="mt-1.5" />
            <p className="mt-1 text-xs text-muted-foreground">{maxGuests} spot(s) available</p>
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
                    { value: "offline", label: mode === "experience" ? "Pay at the Mart" : "Pay at the Event" },
                    { value: "online", label: "Pay Online Now" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-center justify-center rounded-xl border py-3 text-center text-sm font-medium",
                      watch("payment_method") === opt.value ? "border-primary bg-primary/10 text-primary" : "border-input"
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
            <span>{formatNaira(unitPrice * guests)}</span>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(mode === "experience" ? 1 : 0)}>
              Back
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              i <= current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {i + 1}
          </div>
          {i < STEPS.length - 1 && <div className={cn("h-px flex-1", i < current ? "bg-primary" : "bg-border")} />}
        </React.Fragment>
      ))}
    </div>
  );
}
