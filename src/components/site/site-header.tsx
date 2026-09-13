import Link from "next/link";
import { getActiveMenus } from "@/lib/queries/menus";
import { getSiteSettings } from "@/lib/queries/site-settings";

export async function SiteHeader() {
  const [menus, settings] = await Promise.all([
    getActiveMenus(),
    getSiteSettings(),
  ]);

  return (
    <header className="border-b" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-site-heading)" }}
        >
          {settings.content.site_name}
        </Link>

        <nav className="flex gap-6">
          {menus.map((menu) => (
            <Link
              key={menu.id}
              href={`/${menu.slug}`}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: "var(--muted-foreground)" }}
            >
              {menu.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
