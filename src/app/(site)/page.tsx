import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, ChefHat, PartyPopper, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/product-card";
import { getSettings } from "@/lib/data/settings";
import { getFeaturedProducts, getNewArrivals } from "@/lib/data/products";
import { getUpcomingActivities } from "@/lib/data/activities";
import { getActiveExperiences } from "@/lib/data/experiences";
import { formatNaira, formatDate, formatTime } from "@/lib/utils";

export default async function HomePage() {
  const [settings, featured, newArrivals, activities, experiences] = await Promise.all([
    getSettings(),
    getFeaturedProducts(8),
    getNewArrivals(8),
    getUpcomingActivities(),
    getActiveExperiences(),
  ]);

  const eatCook = experiences[0];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/60 to-background">
        <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Jos, Plateau State
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-balance md:text-6xl">
              {settings.hero_title}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">{settings.hero_subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/shop">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/book">Book a Visit</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-xl">
            {settings.hero_image_url ? (
              <Image src={settings.hero_image_url} alt={settings.business_name} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl">🍜🥢🇰🇷</div>
            )}
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN DO */}
      <section className="section container">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard icon={<ShoppingBag className="h-6 w-6" />} title="Shop Korean groceries" desc="Ramen, snacks, sauces, drinks and more, sourced with care." />
          <FeatureCard icon={<ChefHat className="h-6 w-6" />} title="Cook and eat at the mart" desc="Pick your noodles, cook them your way, and enjoy them on site." />
          <FeatureCard icon={<PartyPopper className="h-6 w-6" />} title="Join activities" desc="Cooking sessions, tasting nights, and Korean culture experiences." />
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="section container">
          <SectionHeading eyebrow="Shop" title="Featured Products" href="/shop" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* EAT & COOK */}
      <section className="section bg-primary/5">
        <div className="container grid items-center gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
            {eatCook?.image_url ? (
              <Image src={eatCook.image_url} alt={eatCook.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl">🍲</div>
            )}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">Eat & Cook Experience</span>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Cook it yourself. Eat it fresh. Right here at the mart.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pick your favourite Korean noodles, cook them your way, and enjoy them right here at Korea Mart Jos.
              {eatCook && ` Sessions from ${formatNaira(eatCook.default_price)} per person.`}
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/eat-cook">Book Your Session</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ACTIVITIES */}
      {activities.length > 0 && (
        <section className="section container">
          <SectionHeading eyebrow="What's on" title="Upcoming Activities" href="/activities" />
          <div className="grid gap-6 md:grid-cols-3">
            {activities.slice(0, 3).map((a) => (
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
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(a.event_date)} · {formatTime(a.start_time)}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold text-primary">{formatNaira(a.price)}</span>
                    <span className="text-xs text-muted-foreground">
                      {(a.remaining ?? 0) > 0 ? `${a.remaining} spots left` : "Fully booked"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="section container">
          <SectionHeading eyebrow="Just in" title="New Arrivals" href="/shop" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* WHY KOREA MART */}
      <section className="section container">
        <div className="grid gap-6 text-center md:grid-cols-4">
          {[
            ["Authentic Korean products", "Sourced and stocked with care"],
            ["Fun food experiences", "Cook and eat right at the mart"],
            ["Discover Korean culture", "Through food, snacks & activities"],
            ["Located in Jos", "Easy to find, easy to visit"],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-border/60 p-6">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LOCATION */}
      <section className="section container">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-accent/50 p-10 text-center">
          <MapPin className="h-8 w-8 text-primary" />
          <h2 className="font-display text-2xl font-bold">Find us in Jos</h2>
          <p className="max-w-md text-muted-foreground">{settings.address}</p>
          {settings.google_maps_url && (
            <Button asChild variant="outline">
              <a href={settings.google_maps_url} target="_blank" rel="noopener noreferrer">
                Get Directions
              </a>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, href }: { eyebrow: string; title: string; href: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">{eyebrow}</span>
        <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
      </div>
      <Link href={href} className="hidden text-sm font-medium text-primary hover:underline md:inline">
        View all →
      </Link>
    </div>
  );
}
