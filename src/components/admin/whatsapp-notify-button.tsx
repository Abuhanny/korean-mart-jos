"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markOrderNotified, markBookingNotified } from "@/lib/actions/notifications";

export function WhatsAppNotifyButton({
  href,
  kind,
  id,
  label = "Contact on WhatsApp",
  size = "sm",
  className,
}: {
  href: string;
  kind: "order" | "experience" | "activity";
  id: string;
  label?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const router = useRouter();

  // Fires in the background — doesn't block the WhatsApp tab from opening.
  // Clicking through is treated as "staff has now told the customer",
  // which clears the reminder badge elsewhere in the dashboard.
  const handleClick = () => {
    const promise = kind === "order" ? markOrderNotified(id) : markBookingNotified(kind, id);
    promise.then(() => router.refresh());
  };

  return (
    <Button asChild variant="whatsapp" size={size} className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        <MessageCircle className="h-4 w-4" /> {label}
      </a>
    </Button>
  );
}
