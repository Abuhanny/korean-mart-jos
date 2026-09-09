"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/experiences", label: "Experiences & Sessions" },
  { href: "/admin/activities", label: "Activities" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminMobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between border-b border-border/60 p-4 lg:hidden">
      <p className="font-display text-lg font-bold text-primary">Korea Mart Jos</p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="rounded-full p-2 hover:bg-accent" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Admin Menu</DialogTitle>
          <nav className="flex flex-col gap-1 pt-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent">
                {link.label}
              </Link>
            ))}
            <button onClick={signOut} className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-accent">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}
