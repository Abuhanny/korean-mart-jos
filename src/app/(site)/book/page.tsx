import type { Metadata } from "next";
import { Suspense } from "react";
import BookingWizard from "./booking-wizard";
import { isPaystackConfigured } from "@/lib/payments-config";

export const metadata: Metadata = {
  title: "Book a Visit",
  description: "Book an Eat & Cook session or reserve a spot at an upcoming activity at Korea Mart Jos.",
};

export default function BookPage() {
  return (
    <Suspense fallback={<div className="container section text-center text-muted-foreground">Loading...</div>}>
      <BookingWizard paystackEnabled={isPaystackConfigured()} />
    </Suspense>
  );
}
