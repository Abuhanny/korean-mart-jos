"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/site/cart-provider";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { placeOrder } from "@/lib/actions/orders";
import { formatNaira, cn } from "@/lib/utils";

export default function CheckoutForm({ paystackEnabled }: { paystackEnabled: boolean }) {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fulfillment: "pickup", payment_method: "offline" },
  });

  const fulfillment = watch("fulfillment");
  const paymentMethod = watch("payment_method");

  if (items.length === 0 && !submitting) {
    return (
      <div className="container section text-center">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add products before checking out.</p>
        <Button asChild className="mt-6">
          <a href="/shop">Go to Shop</a>
        </Button>
      </div>
    );
  }

  const onSubmit = async (values: CheckoutInput) => {
    setSubmitting(true);
    const result = await placeOrder(values, items);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Could not place order. Please try again.");
      return;
    }

    clearCart();

    if (result.authorizationUrl) {
      window.location.href = result.authorizationUrl;
      return;
    }

    if (result.paymentError) {
      toast.error("Order placed, but online payment couldn't start. You can pay on pickup or retry from your order page.");
    }

    router.push(`/order/${result.orderNumber}`);
  };

  return (
    <div className="container section">
      <h1 className="mb-8 font-display text-3xl font-bold">Checkout</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 lg:col-span-2">
          <div>
            <Label htmlFor="customer_name">Full Name</Label>
            <Input id="customer_name" {...register("customer_name")} className="mt-1.5" />
            {errors.customer_name && <p className="mt-1 text-sm text-destructive">{errors.customer_name.message}</p>}
          </div>
          <div>
            <Label htmlFor="customer_phone">Phone Number</Label>
            <Input id="customer_phone" {...register("customer_phone")} className="mt-1.5" placeholder="080XXXXXXXX" />
            {errors.customer_phone && <p className="mt-1 text-sm text-destructive">{errors.customer_phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="customer_email">Email (optional)</Label>
            <Input id="customer_email" type="email" {...register("customer_email")} className="mt-1.5" />
            {errors.customer_email && <p className="mt-1 text-sm text-destructive">{errors.customer_email.message}</p>}
          </div>

          <div>
            <Label>Pickup or Delivery</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              {(["pickup", "delivery"] as const).map((opt) => (
                <label
                  key={opt}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-xl border py-3 text-sm font-medium capitalize",
                    fulfillment === opt ? "border-primary bg-primary/10 text-primary" : "border-input"
                  )}
                >
                  <input type="radio" value={opt} {...register("fulfillment")} className="sr-only" />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {fulfillment === "delivery" && (
            <div>
              <Label htmlFor="delivery_address">Delivery Address</Label>
              <Textarea id="delivery_address" {...register("delivery_address")} className="mt-1.5" />
              {errors.delivery_address && (
                <p className="mt-1 text-sm text-destructive">{errors.delivery_address.message}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea id="notes" {...register("notes")} className="mt-1.5" placeholder="Any special requests..." />
          </div>

          {paystackEnabled && (
            <div>
              <Label>Payment</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "offline", label: "Pay on Pickup/Delivery" },
                    { value: "online", label: "Pay Online Now" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-center justify-center rounded-xl border py-3 text-center text-sm font-medium",
                      paymentMethod === opt.value ? "border-primary bg-primary/10 text-primary" : "border-input"
                    )}
                  >
                    <input type="radio" value={opt.value} {...register("payment_method")} className="sr-only" />
                    {opt.label}
                  </label>
                ))}
              </div>
              {paymentMethod === "online" && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  You'll be redirected to Paystack to pay securely by card, bank transfer, or USSD.
                </p>
              )}
            </div>
          )}

          <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Placing Order..." : "Place Order"}
          </Button>
        </form>

        <div className="h-fit rounded-2xl border border-border/60 p-6">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.product_id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {i.quantity} × {i.name}
                </span>
                <span>{formatNaira(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="my-4 border-t border-border/60" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatNaira(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
