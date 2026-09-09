import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Clock, Users } from "lucide-react";
import { getActivityBySlug } from "@/lib/data/activities";
import { getSettings } from "@/lib/data/settings";
import { formatDate, formatTime, formatNaira } from "@/lib/utils";
import { ActivityBookingForm } from "@/components/site/activity-booking-form";
import { isPaystackConfigured } from "@/lib/payments-config";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const activity = await getActivityBySlug(params.slug);
  if (!activity) return {};
  return {
    title: activity.title,
    description: activity.description ?? `${activity.title} at Korea Mart Jos.`,
    openGraph: { images: activity.image_url ? [activity.image_url] : [] },
  };
}

export const dynamic = "force-dynamic";

export default async function ActivityDetailPage({ params }: { params: { slug: string } }) {
  const [activity, settings] = await Promise.all([getActivityBySlug(params.slug), getSettings()]);
  if (!activity) notFound();

  return (
    <div className="container section">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
          {activity.image_url ? (
            <Image src={activity.image_url} alt={activity.title} fill className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">🎉</div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">{activity.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatDate(activity.event_date)}, {formatTime(activity.start_time)}{activity.end_time ? ` – ${formatTime(activity.end_time)}` : ""}</span>
            {activity.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {activity.location}</span>}
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {activity.remaining ?? activity.capacity} spots left</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-primary">{formatNaira(activity.price)} <span className="text-sm font-normal text-muted-foreground">per person</span></p>

          {activity.description && <p className="mt-5 text-muted-foreground">{activity.description}</p>}

          {activity.what_included?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 font-semibold">What's included</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {activity.what_included.map((item, i) => (
                  <li key={i}>✓ {item}</li>
                ))}
              </ul>
            </div>
          )}

          {activity.requirements?.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 font-semibold">Requirements</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {activity.requirements.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <ActivityBookingForm activity={activity} whatsappNumber={settings.whatsapp_number} paystackEnabled={isPaystackConfigured()} />
          </div>
        </div>
      </div>
    </div>
  );
}
