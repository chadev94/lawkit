import { getPageSections } from "@/lib/queries/page-sections";
import { getAllPages, getNavPages } from "@/lib/queries/pages";
import { getActiveSectionsCatalog } from "@/lib/queries/sections";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { HOME_PAGE_SLUG, pagePath } from "@/lib/sections";
import { siteSettingsToCssVars } from "@/lib/site-settings";
import { resolveAdminPageId } from "./actions";
import { SectionsWorkbench } from "./workbench";

export const dynamic = "force-dynamic";

export default async function SectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const [pages, sectionKinds, settings, navPages] = await Promise.all([
    getAllPages(),
    getActiveSectionsCatalog(),
    getSiteSettings(),
    getNavPages(),
  ]);

  const selectedPageId = await resolveAdminPageId(params.page);
  const selectedPage =
    pages.find((page) => page.id === selectedPageId) ??
    pages.find((page) => page.slug === HOME_PAGE_SLUG) ??
    pages[0] ??
    null;

  const sections = selectedPage
    ? await getPageSections(selectedPage.id)
    : [];

  // 페이지 연결 섹션이 끌어올 수 있는 대상. 자기 자신과 홈은 제외한다.
  const linkablePages = pages.filter(
    (page) => page.id !== selectedPage?.id && page.slug !== HOME_PAGE_SLUG,
  );

  return (
    <main className="mx-auto flex max-w-[1500px] flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">페이지 구성</h1>
        <p className="mt-1 text-sm text-zinc-500">
          페이지를 고른 뒤 섹션을 배치합니다. 홈은{" "}
          <code className="text-xs">/</code>, 그 외는{" "}
          <code className="text-xs">/{`{slug}`}</code> 로 열립니다.
        </p>
      </div>

      {pages.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-500">
          pages 테이블이 비어 있습니다. 마이그레이션을 적용하세요.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {pages.map((page) => {
              const active = page.id === selectedPage?.id;
              return (
                <a
                  key={page.id}
                  href={`/admin/sections?page=${page.id}`}
                  className={`rounded px-2.5 py-1 text-xs ${
                    active
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                  title={pagePath(page.slug)}
                >
                  {page.title}
                  {!page.is_active ? " · 숨김" : ""}
                </a>
              );
            })}
          </div>

          {selectedPage && (
            <>
              <p className="text-xs text-zinc-400">
                선택: {selectedPage.title} → {pagePath(selectedPage.slug)}
              </p>

              <SectionsWorkbench
                pageId={selectedPage.id}
                sections={sections}
                linkablePages={linkablePages}
                sectionKinds={sectionKinds}
                cssVars={siteSettingsToCssVars(settings)}
                siteName={settings.content.site_name}
                navTitles={navPages.map((page) => page.title)}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}
