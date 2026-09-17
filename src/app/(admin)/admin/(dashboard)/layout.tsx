import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { logout } from "@/app/(admin)/admin/login/actions";
import { AdminTopBar } from "./top-bar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Proxy 가드에 더해 Server Component에서도 한 번 더 확인한다.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/admin/login");
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : null;
  const settings = await getSiteSettings();
  const siteName = settings.content.site_name?.trim() || "사이트";

  return (
    <div className="flex min-h-screen flex-col">
      <AdminTopBar siteName={siteName} email={email} logout={logout} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
