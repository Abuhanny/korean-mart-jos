import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Users, Clock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveExperiences, getUpcomingSessions } from "@/lib/data/experiences";
import { formatDate, formatTime, formatNaira } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Eat & Cook Experience",
  description:
    "Visit Korea Mart Jos, cook your own Korean noodles, and eat them fresh on site. Book your session today.",
};

export const dynamic = "force-dynamic";

export default async function EatCookPage() {
  const experiences = await getActiveExperiences();
  const experience = experiences[0];
  const sessions = experience ? await getUpcomingSessions(experience.id) : [];

  return (
    <div>
      <section className="bg-primary/5">
        <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">Eat & Cook</span>
            <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
              {experience?.name ?? "Eat & Cook"}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {experience?.description ??
                "Pick your favourite Korean noodles, cook them your way, and enjoy them right here at Korea Mart Jos."}
            </p>
            <div className="mt-6 flex flex-wrap gap-6 text-sm">
              {experience && (
                <>
                  <span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> From {formatNaira(experience.default_price)}</span>
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> ~{experience.default_duration_minutes} mins</span>
                  <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Up to {experience.default_capacity} people</span>
                </>
              )}
            </div>
            <Button asChild size="lg" className="mt-8">
              <Link href={`/book${experience ? `?experience=${experience.slug}` : ""}`}>Book Your Session</Link>
            </Button>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-xl">
            {experience?.image_url ? (
              <Image src={experience.image_url} alt={experience.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl">🍲</div>
            )}
          </div>
        </div>
      </section>

      {experience && (experience.what_included?.length > 0 || experience.what_to_know?.length > 0) && (
        <section className="container section grid gap-10 md:grid-cols-2">
          {experience.what_included?.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-2xl font-bold">What's included</h2>
              <ul className="space-y-2 text-muted-foreground">
                {experience.what_included.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {experience.what_to_know?.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-2xl font-bold">Before you arrive</h2>
              <ul className="space-y-2 text-muted-foreground">
                {experience.what_to_know.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-secondary">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="container section">
        <h2 className="mb-6 font-display text-2xl font-bold">Available Sessions</h2>
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
            No sessions are currently open for booking. Please check back soon or contact us on WhatsApp.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {sessions.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border/60 p-5">
                <p className="font-semibold">{formatDate(s.session_date)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(s.start_time)} – {formatTime(s.end_time)}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-primary">{formatNaira(s.price)}</span>
                  <span className="text-muted-foreground">{s.remaining} spots left</span>
                </div>
                <Button asChild size="sm" className="mt-4 w-full">
                  <Link href={`/book?experience=${experience?.slug}&session=${s.id}`}>Book This Session</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
