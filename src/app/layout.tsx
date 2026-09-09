import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { CartProvider } from "@/components/site/cart-provider";
import { getSettings } from "@/lib/data/settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = `${settings.business_name} — Korean Groceries, Food & Experiences in Jos`;
  const description = settings.description;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${settings.business_name}`,
    },
    description,
    keywords: [
      "Korean Mart Jos",
      "Korean food in Jos",
      "Korean groceries in Jos",
      "Korean restaurant experience Jos",
      "Korean snacks Jos",
      "Asian groceries Jos Nigeria",
    ],
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: settings.business_name,
      images: settings.hero_image_url ? [settings.hero_image_url] : [],
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased">
        <CartProvider>{children}</CartProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
