import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBookingByReference } from "@/lib/actions/bookings";
import { getSettings } from "@/lib/data/settings";
import { formatDate, formatTime, formatNaira } from "@/lib/utils";
import { whatsappBookingMessage } from "@/lib/whatsapp";
import { PayNowButton } from "@/components/site/pay-now-button";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Confirmation",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};
const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  confirmed: "default",
  completed: "success",
  cancelled: "destructive",
  rejected: "destructive",
};
const PAYMENT_STATUS_LABEL: Record<string, string> = {
  not_required: "Pay at the Mart",
  pending: "Payment Pending",
  paid: "Paid",
  failed: "Payment Failed",
};
const PAYMENT_STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
  not_required: "outline",
  pending: "warning",
  paid: "success",
  failed: "destructive",
};

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: { reference: string };
  searchParams: { payment?: string };
}) {
  const [result, settings] = await Promise.all([getBookingByReference(params.reference), getSettings()]);
  if (!result) notFound();

  const { kind, booking } = result;
  const title = kind === "experience" ? booking.session?.experience?.name ?? "Eat & Cook" : booking.activity?.title;
  const date = kind === "experience" ? booking.session?.session_date : booking.activity?.event_date;
  const time =
    kind === "experience"
      ? `${formatTime(booking.session?.start_time ?? "00:00:00")} – ${formatTime(booking.session?.end_time ?? "00:00:00")}`
      : formatTime(booking.activity?.start_time ?? "00:00:00");
  const unitPrice = kind === "experience" ? booking.session?.price ?? 0 : booking.activity?.price ?? 0;
  const total = unitPrice * booking.guests;

  const waLink = whatsappBookingMessage({
    whatsappNumber: settings.whatsapp_number,
    bookingReference: booking.booking_reference,
    title,
    date: date ? formatDate(date) : "",
    time,
    guests: booking.guests,
    customerName: booking.customer_name,
    customerPhone: booking.customer_phone,
  });

  return (
    <div className="container section max-w-2xl">
      {searchParams.payment === "success" && (
        <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-800">
          Payment successful — your booking is confirmed!
        </div>
      )}
      {searchParams.payment === "failed" && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-red-50 p-4 text-center text-sm font-medium text-red-800">
          <XCircle className="h-4 w-4" /> Payment was not completed. You can retry below or pay at the mart.
        </div>
      )}

      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        <h1 className="mt-4 font-display text-3xl font-bold">Booking {STATUS_LABEL[booking.status]}</h1>
        <p className="mt-2 text-muted-foreground">Thank you, {booking.customer_name}.</p>
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Reference</span>
          <span className="font-mono font-semibold">{booking.booking_reference}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={STATUS_VARIANT[booking.status]}>{STATUS_LABEL[booking.status]}</Badge>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Payment</span>
          <Badge variant={PAYMENT_STATUS_VARIANT[booking.payment_status]}>
            {PAYMENT_STATUS_LABEL[booking.payment_status]}
          </Badge>
        </div>
        <div className="my-4 border-t border-border/60" />
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">
          {date ? formatDate(date) : ""} · {time} · {booking.guests} guest{booking.guests > 1 ? "s" : ""}
        </p>
        <div className="my-4 border-t border-border/60" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatNaira(total)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {booking.payment_method === "online" && booking.payment_status !== "paid" && (
          <PayNowButton
            kind={kind}
            id={booking.id}
            label={booking.payment_status === "failed" ? "Retry Payment" : "Complete Payment"}
          />
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="whatsapp" size="lg" className="flex-1">
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
