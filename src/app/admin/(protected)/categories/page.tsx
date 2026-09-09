import { createClient } from "@/lib/supabase/server";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { CategoryRow } from "@/components/admin/category-row";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Organize your products. Sort order controls how categories appear on the Shop page.
          </p>
        </div>
        <CategoryFormDialog />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-accent/30 text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Sort Order</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="px-4">
            {(categories as Category[] | null)?.map((c) => (
              <CategoryRow key={c.id} category={c} />
            ))}
          </tbody>
        </table>
        {(!categories || categories.length === 0) && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No categories yet. Click "Add Category" to create your first one.
          </p>
        )}
      </div>
    </div>
  );
}
