"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/site/cart-provider";
import { formatNaira } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, totalQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="container section flex flex-col items-center py-24 text-center">
        <ShoppingBag className="mb-4 h-14 w-14 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some Korean groceries to get started.</p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="mb-8 font-display text-3xl font-bold">Your Cart</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.product_id} className="flex gap-4 rounded-2xl border border-border/60 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🍜</div>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/shop/${item.slug}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">{formatNaira(item.price)} each</span>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-full border border-input">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center hover:bg-accent"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center hover:bg-accent"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-semibold">{formatNaira(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
          <Button asChild variant="ghost">
            <Link href="/shop">← Continue Shopping</Link>
          </Button>
        </div>

        <div className="h-fit rounded-2xl border border-border/60 p-6">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items ({totalQuantity})</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
          </div>
          <div className="my-4 border-t border-border/60" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatNaira(subtotal)}</span>
          </div>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
