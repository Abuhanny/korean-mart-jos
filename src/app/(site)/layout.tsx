import { getSettings } from "@/lib/data/settings";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloatingButton } from "@/components/site/whatsapp-button";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      {settings.promo_banner_active && settings.promo_banner_text && (
        <div className="bg-secondary py-2 text-center text-sm font-medium text-secondary-foreground">
          {settings.promo_banner_text}
        </div>
      )}
      <Navbar businessName={settings.business_name} />
      <main>{children}</main>
      <Footer settings={settings} />
      <WhatsAppFloatingButton whatsappNumber={settings.whatsapp_number} />
    </>
  );
}
