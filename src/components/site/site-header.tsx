import Link from "next/link";
import { getNavPages } from "@/lib/queries/pages";
import type { SiteSettings } from "@/lib/site-settings";
import { pagePath } from "@/lib/sections";

export async function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pages = await getNavPages();

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
          {pages.map((page) => (
            <Link
              key={page.id}
              href={pagePath(page.slug)}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: "var(--muted-foreground)" }}
            >
              {page.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
