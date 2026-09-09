import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getUpcomingActivities } from "@/lib/data/activities";
import { formatDate, formatTime, formatNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Activities & Events",
  description: "Korean cooking classes, ramen nights, tastings, and cultural events at Korea Mart Jos.",
};

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const activities = await getUpcomingActivities();

  return (
    <div className="container section">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Activities & Events</h1>
        <p className="mt-2 text-muted-foreground">
          Cooking classes, ramen nights, tastings, and Korean culture experiences.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-16 text-center text-muted-foreground">
          No upcoming activities right now. Check back soon!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => {
            const full = (a.remaining ?? 0) <= 0;
            return (
              <Link
                key={a.id}
                href={`/activities/${a.slug}`}
                className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-muted">
                  {a.image_url ? (
                    <Image src={a.image_url} alt={a.title} fill className="object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">🎉</div>
                  )}
                  {a.is_featured && <Badge className="absolute left-3 top-3">Featured</Badge>}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(a.event_date)} · {formatTime(a.start_time)}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">{formatNaira(a.price)} / person</span>
                    <span className={full ? "font-medium text-red-600" : "text-muted-foreground"}>
                      {full ? "Fully booked" : `${a.remaining} spots left`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
