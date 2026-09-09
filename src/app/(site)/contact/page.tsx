import type { Metadata } from "next";
import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/data/settings";
import { whatsappGeneralContactLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Korea Mart Jos via WhatsApp, phone, or visit us in Jos, Nigeria.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const hoursOrder: (keyof typeof settings.opening_hours)[] = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  ];

  return (
    <div className="container section grid gap-10 md:grid-cols-2">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Contact Us</h1>
        <p className="mt-3 text-muted-foreground">
          Questions about products, bookings, or anything else? Reach out — we'd love to hear from you.
        </p>

        <div className="mt-8 space-y-4">
          <a
            href={whatsappGeneralContactLink(settings.whatsapp_number)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border/60 p-4 hover:bg-accent"
          >
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
            <div>
              <p className="font-medium">WhatsApp</p>
              <p className="text-sm text-muted-foreground">Fastest way to reach us</p>
            </div>
          </a>
          <a href={`tel:${settings.phone}`} className="flex items-center gap-3 rounded-2xl border border-border/60 p-4 hover:bg-accent">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{settings.phone}</p>
              <p className="text-sm text-muted-foreground">Call us</p>
            </div>
          </a>
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-3 rounded-2xl border border-border/60 p-4 hover:bg-accent">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{settings.email}</p>
                <p className="text-sm text-muted-foreground">Email us</p>
              </div>
            </a>
          )}
          <div className="flex items-start gap-3 rounded-2xl border border-border/60 p-4">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{settings.address}</p>
              {settings.google_maps_url && (
                <a href={settings.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                  Get Directions →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Clock className="h-5 w-5" /> Opening Hours
        </h2>
        <ul className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60">
          {hoursOrder.map((day) => (
            <li key={day} className="flex justify-between px-4 py-3 text-sm">
              <span className="capitalize font-medium">{day}</span>
              <span className="text-muted-foreground">{settings.opening_hours[day]}</span>
            </li>
          ))}
        </ul>

        <Button asChild size="lg" variant="whatsapp" className="mt-6 w-full">
          <a href={whatsappGeneralContactLink(settings.whatsapp_number)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
