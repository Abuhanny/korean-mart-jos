import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already redirects unauthenticated users away from /admin/*,
  // but we double-check here (defense in depth) and also verify the user
  // has a `profiles` row — i.e. is actually staff/admin, not just any
  // authenticated Supabase user.
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Authenticated but not provisioned as staff — sign them out and bounce.
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar userName={profile.full_name} role={profile.role} />
      <div className="flex-1">
        <AdminMobileNav />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
