import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const [{ data: products }, { data: activities }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_active", true),
    supabase.from("activities").select("slug, updated_at").eq("is_active", true),
  ]);

  const staticRoutes = ["", "/shop", "/eat-cook", "/activities", "/about", "/contact", "/book"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = (products ?? []).map((p) => ({
    url: `${siteUrl}/shop/${p.slug}`,
    lastModified: new Date(p.updated_at),
  }));

  const activityRoutes = (activities ?? []).map((a) => ({
    url: `${siteUrl}/activities/${a.slug}`,
    lastModified: new Date(a.updated_at),
  }));

  return [...staticRoutes, ...productRoutes, ...activityRoutes];
}
