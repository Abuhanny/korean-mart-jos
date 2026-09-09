import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">We couldn't find the page you're looking for.</p>
      <Button asChild><Link href="/">Back to Home</Link></Button>
    </div>
  );
}
