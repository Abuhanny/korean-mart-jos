import { createClient } from "@/lib/supabase/server";
import { PromotionFormDialog, PromotionRow } from "@/components/admin/promotion-components";
import type { Promotion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const supabase = createClient();
  const { data: promotions } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Promotions</h1>
          <p className="text-sm text-muted-foreground">Simple promotional banners — no coupon codes needed for V1.</p>
        </div>
        <PromotionFormDialog />
      </div>

      <div className="mt-6 space-y-3">
        {(!promotions || promotions.length === 0) && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No promotions yet.
          </p>
        )}
        {(promotions as Promotion[] | null)?.map((p) => (
          <PromotionRow key={p.id} promotion={p} />
        ))}
      </div>
    </div>
  );
}
