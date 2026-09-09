import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/site/product-card";
import { AddToCartForm } from "@/components/site/add-to-cart-form";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getSettings } from "@/lib/data/settings";
import { formatNaira } from "@/lib/utils";
import { whatsappProductInquiryLink } from "@/lib/whatsapp";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description ?? `${product.name} available at Korea Mart Jos.`,
    openGraph: { images: product.image_url ? [product.image_url] : [] },
  };
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([getRelatedProducts(product), getSettings()]);

  return (
    <div className="container section">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        {product.category && (
          <>
            {" / "}
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">🍜</div>
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {product.is_new_arrival && <Badge>New</Badge>}
            {product.is_featured && <Badge variant="secondary">Featured</Badge>}
          </div>
        </div>

        <div>
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
              {product.category.name}
            </span>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-primary">{formatNaira(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatNaira(product.compare_at_price)}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm">
            {product.in_stock ? (
              <span className="font-medium text-emerald-700">In stock</span>
            ) : (
              <span className="font-medium text-red-600">Out of stock</span>
            )}
          </p>

          {product.description && <p className="mt-5 text-muted-foreground">{product.description}</p>}

          {Object.keys(product.attributes ?? {}).length > 0 && (
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {Object.entries(product.attributes).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-muted-foreground capitalize">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8">
            <AddToCartForm product={product} />
          </div>

          <a
            href={whatsappProductInquiryLink(settings.whatsapp_number, product.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#25D366] hover:underline"
          >
            <MessageCircle className="h-4 w-4" /> Order via WhatsApp instead
          </a>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
