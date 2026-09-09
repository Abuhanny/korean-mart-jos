"use client";

import * as React from "react";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initializeOrderPayment, initializeBookingPayment } from "@/lib/actions/payments";

export function PayNowButton({
  kind,
  id,
  label = "Pay Now",
}: {
  kind: "order" | "experience" | "activity";
  id: string;
  label?: string;
}) {
  const [loading, setLoading] = React.useState(false);

  const onClick = async () => {
    setLoading(true);
    const result =
      kind === "order" ? await initializeOrderPayment(id) : await initializeBookingPayment(kind, id);
    setLoading(false);

    if (!result.success || !result.authorizationUrl) {
      toast.error(result.error ?? "Could not start payment. Please try again.");
      return;
    }
    window.location.href = result.authorizationUrl;
  };

  return (
    <Button onClick={onClick} disabled={loading} size="lg" className="w-full">
      <CreditCard className="h-4 w-4" /> {loading ? "Redirecting to Paystack..." : label}
    </Button>
  );
}
