import { getNavPages } from "@/lib/queries/pages";
import type { SiteSettings } from "@/lib/site-settings";
import { SiteHeaderBar } from "@/components/site/site-header-bar";

export async function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pages = await getNavPages();

  return (
    <SiteHeaderBar
      siteName={settings.content.site_name}
      pages={pages.map((p) => ({ id: p.id, title: p.title, slug: p.slug }))}
    />
  );
}
