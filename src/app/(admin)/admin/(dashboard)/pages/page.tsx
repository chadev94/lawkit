import { getPageSections } from "@/lib/queries/page-sections";
import { getAllPages } from "@/lib/queries/pages";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { HOME_PAGE_SLUG } from "@/lib/sections";
import { PagesWorkbench } from "./workbench";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const [pages, settings] = await Promise.all([
    getAllPages(),
    getSiteSettings(),
  ]);
  const home = pages.find((page) => page.slug === HOME_PAGE_SLUG);
  const homeSections = home ? await getPageSections(home.id) : [];

  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-5 px-6 py-6">
      <div>
        <h1 className="a-title">페이지 · 메뉴</h1>
        <p className="a-lead mt-1">
          사이트의 페이지 목록입니다. 이름과 순서가 곧 상단 메뉴가 됩니다. 각
          페이지 안의 내용은 &ldquo;화면&rdquo; 탭에서 고칩니다.
        </p>
      </div>

      <PagesWorkbench
        pages={pages}
        settings={settings}
        homeSections={homeSections}
      />
    </main>
  );
}
