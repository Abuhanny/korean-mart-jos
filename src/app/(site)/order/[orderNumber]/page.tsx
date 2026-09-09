import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MessageCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOrderByNumber } from "@/lib/actions/orders";
import { getSettings } from "@/lib/data/settings";
import { formatNaira } from "@/lib/utils";
import { whatsappOrderMessage } from "@/lib/whatsapp";
import { PayNowButton } from "@/components/site/pay-now-button";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Confirmation",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup/Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  confirmed: "default",
  preparing: "default",
  ready: "success",
  completed: "success",
  cancelled: "destructive",
};

export const dynamic = "force-dynamic";

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  not_required: "Pay on Pickup/Delivery",
  pending: "Payment Pending",
  paid: "Paid",
  failed: "Payment Failed",
};

const PAYMENT_STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
  not_required: "outline",
  pending: "warning",
  paid: "success",
  failed: "destructive",
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { payment?: string };
}) {
  const [order, settings] = await Promise.all([getOrderByNumber(params.orderNumber), getSettings()]);
  if (!order) notFound();

  const waLink = whatsappOrderMessage({
    whatsappNumber: settings.whatsapp_number,
    orderNumber: order.order_number,
    items: order.order_items.map((i: any) => ({
      product_id: i.product_id,
      name: i.product_name,
      slug: "",
      price: i.unit_price,
      image_url: null,
      quantity: i.quantity,
    })),
    total: order.total,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
  });

  return (
    <div className="container section max-w-2xl">
      {searchParams.payment === "success" && (
        <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-800">
          Payment successful — thank you!
        </div>
      )}
      {searchParams.payment === "failed" && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-red-50 p-4 text-center text-sm font-medium text-red-800">
          <XCircle className="h-4 w-4" /> Payment was not completed. You can retry below or pay on pickup.
        </div>
      )}

      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        <h1 className="mt-4 font-display text-3xl font-bold">Order Placed!</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you, {order.customer_name}. We've received your order.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Order Number</span>
          <span className="font-mono font-semibold">{order.order_number}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={STATUS_VARIANT[order.status]}>{STATUS_LABEL[order.status]}</Badge>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Payment</span>
          <Badge variant={PAYMENT_STATUS_VARIANT[order.payment_status]}>
            {PAYMENT_STATUS_LABEL[order.payment_status]}
          </Badge>
        </div>
        <div className="my-4 border-t border-border/60" />
        <ul className="space-y-2 text-sm">
          {order.order_items.map((item: any) => (
            <li key={item.id} className="flex justify-between">
              <span className="text-muted-foreground">
                {item.quantity} × {item.product_name}
              </span>
              <span>{formatNaira(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="my-4 border-t border-border/60" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatNaira(order.total)}</span>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          {order.fulfillment === "delivery" ? (
            <p>Delivery to: {order.delivery_address}</p>
          ) : (
            <p>Pickup at the mart</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {order.payment_method === "online" && order.payment_status !== "paid" && (
          <PayNowButton kind="order" id={order.id} label={order.payment_status === "failed" ? "Retry Payment" : "Complete Payment"} />
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="whatsapp" size="lg" className="flex-1">
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Confirm on WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Bookmark this page or save your order number ({order.order_number}) to check your order status any time.
      </p>
    </div>
  );
}
