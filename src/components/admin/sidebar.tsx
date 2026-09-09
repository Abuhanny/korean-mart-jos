"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  CalendarClock,
  ChefHat,
  PartyPopper,
  Settings,
  Megaphone,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/admin/experiences", label: "Experiences & Sessions", icon: ChefHat },
  { href: "/admin/activities", label: "Activities", icon: PartyPopper },
  { href: "/admin/promotions", label: "Promotions", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ userName, role }: { userName: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-accent/20 p-4 lg:flex">
      <div className="mb-6 px-2">
        <p className="font-display text-lg font-bold text-primary">Korea Mart Jos</p>
        <p className="text-xs text-muted-foreground">Admin Dashboard</p>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-background",
                active && "bg-background text-foreground shadow-sm"
              )}
            >
              <Icon className="h-4 w-4" /> {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 border-t border-border/60 pt-4">
        <p className="px-2 text-sm font-medium">{userName}</p>
        <p className="px-2 text-xs capitalize text-muted-foreground">{role}</p>
        <button
          onClick={signOut}
          className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-background"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
