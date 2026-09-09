import Link from "next/link";
import { Package, ShoppingBag, CalendarClock, AlertTriangle, TrendingUp, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatNaira, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: todayOrders },
    { count: pendingOrders },
    { data: recentOrders },
    { count: pendingBookingsExp },
    { count: pendingBookingsAct },
    { data: upcomingSessions },
    { data: upcomingActivities },
    { count: totalProducts },
    { data: lowStock },
    { data: revenueRows },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("experience_bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("activity_bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("experience_sessions")
      .select("*, experience:experiences(name)")
      .gte("session_date", today)
      .order("session_date", { ascending: true })
      .limit(5),
    supabase
      .from("activities")
      .select("*")
      .gte("event_date", today)
      .eq("is_active", true)
      .order("event_date", { ascending: true })
      .limit(5),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("products")
      .select("id, name, stock_quantity")
      .eq("is_active", true)
      .not("stock_quantity", "is", null)
      .lte("stock_quantity", 5),
    supabase.from("orders").select("total, created_at").eq("status", "completed"),
  ]);

  const totalRevenue = (revenueRows ?? []).reduce((sum, o) => sum + Number(o.total), 0);
  const pendingBookingsTotal = (pendingBookingsExp ?? 0) + (pendingBookingsAct ?? 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold md:text-3xl">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Here's what's happening at Korea Mart Jos today.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Today's Orders" value={todayOrders ?? 0} href="/admin/orders" />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Pending Orders" value={pendingOrders ?? 0} href="/admin/orders?status=pending" accent="warning" />
        <StatCard icon={<CalendarClock className="h-5 w-5" />} label="Pending Bookings" value={pendingBookingsTotal} href="/admin/bookings" accent="warning" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Revenue (completed)" value={formatNaira(totalRevenue)} href="/admin/orders?status=completed" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(recentOrders ?? []).length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
            {(recentOrders ?? []).map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between rounded-xl border border-border/60 p-3 hover:bg-accent">
                <div>
                  <p className="text-sm font-medium">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{o.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatNaira(o.total)}</p>
                  <Badge variant="outline" className="capitalize">{o.status}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Low Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(lowStock ?? []).length === 0 && <p className="text-sm text-muted-foreground">No low-stock alerts.</p>}
            {(lowStock ?? []).map((p) => (
              <Link key={p.id} href={`/admin/products?q=${encodeURIComponent(p.name)}`} className="flex items-center justify-between rounded-xl border border-border/60 p-3 hover:bg-accent">
                <span className="text-sm font-medium">{p.name}</span>
                <Badge variant="warning">{p.stock_quantity} left</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Eat & Cook Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(upcomingSessions ?? []).length === 0 && <p className="text-sm text-muted-foreground">No upcoming sessions.</p>}
            {(upcomingSessions ?? []).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                <div>
                  <p className="text-sm font-medium">{s.experience?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(s.session_date)}</p>
                </div>
                <span className="text-xs text-muted-foreground">Capacity {s.capacity}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-4 w-4" /> Upcoming Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(upcomingActivities ?? []).length === 0 && <p className="text-sm text-muted-foreground">No upcoming activities.</p>}
            {(upcomingActivities ?? []).map((a) => (
              <Link key={a.id} href="/admin/activities" className="flex items-center justify-between rounded-xl border border-border/60 p-3 hover:bg-accent">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.event_date)}</p>
                </div>
                <span className="text-xs text-muted-foreground">Cap. {a.capacity}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Total active products: {totalProducts ?? 0}
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href: string;
  accent?: "warning";
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full ${accent === "warning" ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"}`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
