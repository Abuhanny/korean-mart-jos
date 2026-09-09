import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="container section text-center">
      <h1 className="font-display text-3xl font-bold">Product Not Found</h1>
      <p className="mt-2 text-muted-foreground">This product may have been removed or is no longer available.</p>
      <Button asChild className="mt-6"><Link href="/shop">Back to Shop</Link></Button>
    </div>
  );
}
