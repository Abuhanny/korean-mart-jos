import { createClient } from "@/lib/supabase/server";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { ProductRow } from "@/components/admin/product-row";
import type { Product, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const supabase = createClient();

  let query = supabase.from("products").select("*, category:categories(*)").order("created_at", { ascending: false });
  if (searchParams.q) query = query.ilike("name", `%${searchParams.q}%`);
  if (searchParams.category) query = query.eq("category_id", searchParams.category);

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Add what you sell — changes go live on the site instantly.</p>
        </div>
        <ProductFormDialog categories={(categories as Category[]) ?? []} />
      </div>

      <form className="mt-6 flex gap-3" action="/admin/products">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search products..."
          className="h-10 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-sm"
        />
        <button type="submit" className="rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-accent/30 text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">In Stock</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">New</th>
              <th className="px-4 py-3">Stock Qty</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="px-4">
            {(products as Product[] | null)?.map((p) => (
              <ProductRow key={p.id} product={p} categories={(categories as Category[]) ?? []} />
            ))}
          </tbody>
        </table>
        {(!products || products.length === 0) && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No products yet. Click "Add Product" to create your first one.
          </p>
        )}
      </div>
    </div>
  );
}
