import { getPageSections } from "@/lib/queries/page-sections";
import { getAllPages, getNavPages } from "@/lib/queries/pages";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getThemePresets } from "@/lib/queries/theme-presets";
import { HOME_PAGE_SLUG } from "@/lib/sections";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const [settings, themePresets, pages, navPages] = await Promise.all([
    getSiteSettings(),
    getThemePresets(),
    getAllPages(),
    getNavPages(),
  ]);
  const home = pages.find((page) => page.slug === HOME_PAGE_SLUG);
  const homeSections = home ? await getPageSections(home.id) : [];

  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-5 px-6 py-6">
      <div>
        <h1 className="a-title">사이트 설정</h1>
        <p className="a-lead mt-1">
          사무소 이름·연락처·색·글꼴. 모든 페이지에 함께 적용됩니다. 고치는 동안
          오른쪽에서 결과가 보이고, 저장하면 사이트에 반영됩니다.
        </p>
      </div>

      <SettingsForm
        settings={settings}
        themePresets={themePresets}
        nav={navPages.map((page) => ({ id: page.id, title: page.title }))}
        homeSections={homeSections}
      />
    </main>
  );
}
