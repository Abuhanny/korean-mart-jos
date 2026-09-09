import type { Metadata } from "next";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Korea Mart Jos — Korean groceries, food experiences and culture in Jos, Nigeria.",
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="container section container-narrow">
      <h1 className="font-display text-3xl font-bold md:text-4xl">About {settings.business_name}</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{settings.description}</p>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        {settings.business_name} brings a little piece of Korea to Jos — from shelves stocked with ramen,
        snacks, sauces and Korean pantry staples, to a cozy space where you can cook your own noodles and eat
        them fresh. Beyond groceries, we host cooking sessions, tasting nights and cultural activities so our
        community can experience Korean food and culture together.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 p-6 text-center">
          <p className="text-3xl">🛒</p>
          <p className="mt-2 font-semibold">Shop</p>
          <p className="text-sm text-muted-foreground">Authentic Korean & Asian groceries</p>
        </div>
        <div className="rounded-2xl border border-border/60 p-6 text-center">
          <p className="text-3xl">🍜</p>
          <p className="mt-2 font-semibold">Eat & Cook</p>
          <p className="text-sm text-muted-foreground">Cook and enjoy Korean food on site</p>
        </div>
        <div className="rounded-2xl border border-border/60 p-6 text-center">
          <p className="text-3xl">🎉</p>
          <p className="mt-2 font-semibold">Activities</p>
          <p className="text-sm text-muted-foreground">Cultural events and food experiences</p>
        </div>
      </div>
    </div>
  );
}
