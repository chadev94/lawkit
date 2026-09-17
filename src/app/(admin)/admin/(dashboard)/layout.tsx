import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { logout } from "@/app/(admin)/admin/login/actions";

const NAV = [
  { href: "/admin/settings", label: "사이트 설정" },
  { href: "/admin/pages", label: "페이지 관리" },
  { href: "/admin/sections", label: "화면 구성" },
];

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
    <div className="flex min-h-screen">
      <aside
        className="sticky top-0 flex h-screen w-52 shrink-0 flex-col p-5"
        style={{
          background: "var(--a-surface)",
          borderRight: "1px solid var(--a-line)",
        }}
      >
        <div className="a-brand">
          <b>{siteName}</b>
          <a href="/" target="_blank" rel="noreferrer">
            사이트 열기 ↗
          </a>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="a-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col items-start gap-1.5 pt-8">
          {email && (
            <p className="a-hint max-w-full truncate px-2.5" title={email}>
              {email}
            </p>
          )}
          <form action={logout}>
            <button type="submit" className="a-btn a-btn-quiet a-btn-sm">
              로그아웃
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
