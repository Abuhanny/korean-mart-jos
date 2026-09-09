import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BellRing } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { whatsappMessageToCustomer } from "@/lib/whatsapp";
import { OrderStatusControls, OrderInternalNotes } from "@/components/admin/order-controls";
import { WhatsAppNotifyButton } from "@/components/admin/whatsapp-notify-button";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: order } = await supabase.from("orders").select("*, order_items(*)").eq("id", params.id).single();

  if (!order) notFound();

  const waLink = whatsappMessageToCustomer(
    order.customer_phone,
    `Hello ${order.customer_name}, this is Korea Mart Jos regarding your order ${order.order_number}. Your order is now "${order.status}".`
  );

  return (
    <div className="max-w-2xl">
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      {!order.customer_notified && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800">
          <BellRing className="h-4 w-4 shrink-0" /> This order's status changed — the customer hasn't been notified yet.
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">Placed {new Date(order.created_at).toLocaleString()}</p>
          <p className="mt-1 text-sm">
            Payment:{" "}
            {order.payment_method === "online" ? (
              <span className="font-medium capitalize">{order.payment_status} (online)</span>
            ) : (
              <span className="font-medium text-muted-foreground">Pay on pickup/delivery</span>
            )}
          </p>
        </div>
        <OrderStatusControls orderId={order.id} status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 p-5">
          <h2 className="mb-3 font-semibold">Customer</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{order.customer_name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{order.customer_phone}</dd></div>
            {order.customer_email && <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{order.customer_email}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted-foreground">Fulfillment</dt><dd className="capitalize">{order.fulfillment}</dd></div>
            {order.delivery_address && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Address</dt><dd className="text-right">{order.delivery_address}</dd></div>}
          </dl>
          <WhatsAppNotifyButton
            href={waLink}
            kind="order"
            id={order.id}
            label={order.customer_notified ? "Message Customer Again" : "Contact on WhatsApp"}
            className="mt-4 w-full"
          />
        </div>

        <div className="rounded-2xl border border-border/60 p-5">
          <h2 className="mb-3 font-semibold">Items</h2>
          <ul className="space-y-2 text-sm">
            {order.order_items.map((item: any) => (
              <li key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">{item.quantity} × {item.product_name}</span>
                <span>{formatNaira(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="my-3 border-t border-border/60" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="mt-6 rounded-2xl border border-border/60 p-5">
          <h2 className="mb-2 font-semibold">Customer Notes</h2>
          <p className="text-sm text-muted-foreground">{order.notes}</p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border/60 p-5">
        <h2 className="mb-2 font-semibold">Internal Notes</h2>
        <OrderInternalNotes orderId={order.id} initialNotes={order.internal_notes} />
      </div>
    </div>
  );
}
