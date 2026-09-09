import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/site/product-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop Korean Groceries",
  description: "Browse ramen, snacks, sauces, drinks and Korean ingredients at Korea Mart Jos.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; sort?: "newest" | "price_asc" | "price_desc" };
}) {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: searchParams.category, search: searchParams.q, sort: searchParams.sort }),
  ]);

  return (
    <div className="container section">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Shop</h1>
        <p className="mt-2 text-muted-foreground">Korean & Asian groceries, snacks and pantry staples.</p>
      </div>

      <form className="mb-6 flex flex-col gap-3 md:flex-row md:items-center" action="/shop">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search products..."
          className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm md:max-w-xs"
        />
        {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
        <select
          name="sort"
          defaultValue={searchParams.sort ?? "newest"}
          className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <button type="submit" className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground">
          Apply
        </button>
      </form>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm",
            !searchParams.category ? "bg-primary text-primary-foreground" : "border-border hover:bg-accent"
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.slug}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              searchParams.category === c.slug ? "bg-primary text-primary-foreground" : "border-border hover:bg-accent"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-16 text-center text-muted-foreground">
          No products found. Try a different search or category.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
