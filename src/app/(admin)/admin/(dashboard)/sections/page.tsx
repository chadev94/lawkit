import { getPageSections } from "@/lib/queries/page-sections";
import { getAllPages, getNavPages } from "@/lib/queries/pages";
import { getActiveSectionsCatalog } from "@/lib/queries/sections";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { HOME_PAGE_SLUG, pagePath } from "@/lib/sections";
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
    <main className="mx-auto flex max-w-[1600px] flex-col gap-5 px-6 py-6">
      <div>
        <h1 className="a-title">화면 구성</h1>
        <p className="a-lead mt-1">
          페이지를 고르면 그 화면의 블록이 위에서 아래로 보이는 순서대로 나옵니다.
          행을 누르면 고칠 수 있고, 고치는 동안 오른쪽에서 결과가 보입니다.
        </p>
      </div>

      {pages.length === 0 ? (
        <p className="a-card a-lead p-4">
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
                  className="a-tab"
                  data-active={active || undefined}
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
              <p className="a-hint">
                {selectedPage.title} · 주소 {pagePath(selectedPage.slug)}
              </p>

              <SectionsWorkbench
                pageId={selectedPage.id}
                pagePath={pagePath(selectedPage.slug)}
                sections={sections}
                linkablePages={linkablePages}
                sectionKinds={sectionKinds}
                settings={settings}
                nav={navPages.map((page) => ({ id: page.id, title: page.title }))}
                pageTitle={selectedPage.title}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}
