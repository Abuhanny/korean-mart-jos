"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, X, CalendarHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/site/cart-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/eat-cook", label: "Eat & Cook" },
  { href: "/activities", label: "Activities" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ businessName }: { businessName: string }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { totalQuantity } = useCart();

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-primary">
          {businessName}
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-foreground/70 transition-colors hover:text-foreground",
                pathname === link.href && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="outline" size="sm">
            <Link href="/book">
              <CalendarHeart className="h-4 w-4" /> Book a Visit
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/shop">Order Now</Link>
          </Button>
          <Link href="/cart" className="relative rounded-full p-2 hover:bg-accent" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {totalQuantity > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/cart" className="relative rounded-full p-2 hover:bg-accent" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {totalQuantity > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                {totalQuantity}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full p-2 hover:bg-accent"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <nav className="container flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-base font-medium text-foreground/80 hover:bg-accent",
                  pathname === link.href && "bg-accent text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 px-3 pb-2">
              <Button asChild variant="outline">
                <Link href="/book">
                  <CalendarHeart className="h-4 w-4" /> Book a Visit
                </Link>
              </Button>
              <Button asChild>
                <Link href="/shop">Order Now</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
