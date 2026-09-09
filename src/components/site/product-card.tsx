import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🍜</div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.is_new_arrival && <Badge>New</Badge>}
          {product.is_featured && <Badge variant="secondary">Featured</Badge>}
        </div>
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Badge variant="destructive">Out of stock</Badge>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category?.name && (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{product.category.name}</span>
        )}
        <h3 className="line-clamp-2 font-medium leading-snug">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-semibold text-primary">{formatNaira(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatNaira(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
