import Link from "next/link";
import { getActiveMenus } from "@/lib/queries/menus";

export async function SiteHeader() {
  const menus = await getActiveMenus();

  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          YOO &amp; PARTNERS
        </Link>

        <nav className="flex gap-6">
          {menus.map((menu) => (
            <Link
              key={menu.id}
              href={`/${menu.slug}`}
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              {menu.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
