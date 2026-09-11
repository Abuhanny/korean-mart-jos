import Link from "next/link";
import { MapPin, Clock, Phone, Instagram, Facebook, Youtube } from "lucide-react";
import type { BusinessSettings } from "@/lib/types";
import { TikTokIcon, XIcon } from "@/components/site/brand-icons";

export function Footer({ settings }: { settings: BusinessSettings }) {
  const hoursOrder: (keyof BusinessSettings["opening_hours"])[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <footer className="mt-24 border-t border-border/60 bg-accent/40">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div>
          <h3 className="font-display text-lg font-bold text-primary">{settings.business_name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{settings.description}</p>
          <div className="mt-4 flex gap-3">
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-background p-2 hover:bg-primary hover:text-primary-foreground" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-background p-2 hover:bg-primary hover:text-primary-foreground" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {settings.tiktok_url && (
              <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-background p-2 hover:bg-primary hover:text-primary-foreground" aria-label="TikTok">
                <TikTokIcon className="h-4 w-4" />
              </a>
            )}
            {settings.youtube_url && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-background p-2 hover:bg-primary hover:text-primary-foreground" aria-label="YouTube">
                <Youtube className="h-4 w-4" />
              </a>
            )}
            {settings.twitter_url && (
              <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-background p-2 hover:bg-primary hover:text-primary-foreground" aria-label="X (Twitter)">
                <XIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/70">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="text-muted-foreground hover:text-foreground">Shop</Link></li>
            <li><Link href="/eat-cook" className="text-muted-foreground hover:text-foreground">Eat & Cook</Link></li>
            <li><Link href="/activities" className="text-muted-foreground hover:text-foreground">Activities</Link></li>
            <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/70">
            <Clock className="h-4 w-4" /> Opening Hours
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {hoursOrder.map((day) => (
              <li key={day} className="flex justify-between gap-4">
                <span className="capitalize">{day}</span>
                <span>{settings.opening_hours[day]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/70">Visit Us</h4>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {settings.address}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" /> {settings.phone}
            </p>
            {settings.google_maps_url && (
              <a
                href={settings.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-medium text-primary hover:underline"
              >
                Get Directions →
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {settings.business_name}. All rights reserved.
      </div>
    </footer>
  );
}
