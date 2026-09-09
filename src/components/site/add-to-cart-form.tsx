"use client";

import * as React from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/site/cart-provider";
import type { Product } from "@/lib/types";

export function AddToCartForm({ product }: { product: Product }) {
  const [quantity, setQuantity] = React.useState(1);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url,
      quantity,
    });
    toast.success(`Added ${quantity} × ${product.name} to cart`);
  };

  if (!product.in_stock) {
    return (
      <Button disabled size="lg" className="w-full md:w-auto">
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center rounded-full border border-input">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button size="lg" onClick={handleAdd} className="flex-1 sm:flex-none">
        <ShoppingCart className="h-4 w-4" /> Add to Cart
      </Button>
    </div>
  );
}
