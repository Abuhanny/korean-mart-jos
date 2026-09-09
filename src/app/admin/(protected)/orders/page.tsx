import Link from "next/link";
import { BellRing } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_VARIANT: Record<OrderStatus, "default" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  confirmed: "default",
  preparing: "default",
  ready: "success",
  completed: "success",
  cancelled: "destructive",
};

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = createClient();
  const status = searchParams.status as OrderStatus | undefined;

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: orders } = await query;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Orders</h1>
      <p className="text-sm text-muted-foreground">See customer orders and update their status.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={s.value === "all" ? "/admin/orders" : `/admin/orders?status=${s.value}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              (s.value === "all" && !status) || status === s.value
                ? "bg-primary text-primary-foreground"
                : "border-border hover:bg-accent"
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-accent/30 text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {(orders as Order[] | null)?.map((o) => (
              <tr key={o.id} className="border-b border-border/60 last:border-0 hover:bg-accent/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-primary hover:underline">
                    {o.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    {o.customer_name}
                    {!o.customer_notified && (
                      <BellRing className="h-3.5 w-3.5 text-amber-600" aria-label="Customer not yet notified" />
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{o.customer_phone}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{o.fulfillment}</td>
                <td className="px-4 py-3 font-medium">{formatNaira(o.total)}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[o.status]} className="capitalize">{o.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  {o.payment_method === "online" ? (
                    <Badge
                      variant={o.payment_status === "paid" ? "success" : o.payment_status === "failed" ? "destructive" : "warning"}
                      className="capitalize"
                    >
                      {o.payment_status}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">On pickup</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && (
          <p className="p-8 text-center text-sm text-muted-foreground">No orders found.</p>
        )}
      </div>
    </div>
  );
}
