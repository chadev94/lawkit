import Link from "next/link";

const NAV = [
  { href: "/admin/sections", label: "메인 구성" },
  { href: "/admin/menus", label: "메뉴 관리" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: 인증 가드 — 로그인하지 않았으면 /admin/login 으로 (YP-4)
  return (
    <div className="flex min-h-screen">
      <aside className="w-48 shrink-0 border-r border-zinc-200 p-6">
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
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
