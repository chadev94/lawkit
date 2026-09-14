import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(admin)/admin/login/actions";

const NAV = [
  { href: "/admin/settings", label: "사이트 설정" },
  { href: "/admin/sections", label: "페이지 구성" },
  { href: "/admin/menus", label: "메뉴 관리" },
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

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-48 shrink-0 flex-col border-r border-zinc-200 p-6">
        <p className="text-xs font-semibold tracking-tight">ADMIN</p>
        <nav className="mt-6 flex flex-col gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-8">
          {email && (
            <p className="truncate text-[11px] text-zinc-400" title={email}>
              {email}
            </p>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-zinc-500 hover:text-zinc-900"
            >
              로그아웃
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
