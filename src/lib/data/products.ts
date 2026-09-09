import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
  return (data as Category[]) ?? [];
}

export async function getProducts(filters?: {
  categorySlug?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc";
}): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true);

  if (filters?.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (filters?.sort === "price_asc") query = query.order("price", { ascending: true });
  else if (filters?.sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data } = await query;
  return (data as Product[]) ?? [];
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(limit);
  return (data as Product[]) ?? [];
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .eq("is_new_arrival", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Product[]) ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return (data as Product) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(limit);
  if (product.category_id) query = query.eq("category_id", product.category_id);
  const { data } = await query;
  return (data as Product[]) ?? [];
}
