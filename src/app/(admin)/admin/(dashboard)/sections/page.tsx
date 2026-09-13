import { getAllMenus } from "@/lib/queries/menus";
import { getPageSections } from "@/lib/queries/page-sections";
import { getAllPages } from "@/lib/queries/pages";
import { getActiveSectionsCatalog } from "@/lib/queries/sections";
import { HOME_PAGE_SLUG, pagePath } from "@/lib/sections";
import { resolveAdminPageId } from "./actions";
import { SectionForm } from "./section-form";
import { SectionItem } from "./section-item";

export const dynamic = "force-dynamic";

export default async function SectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const [pages, menus, sectionKinds] = await Promise.all([
    getAllPages(),
    getAllMenus(),
    getActiveSectionsCatalog(),
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

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
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

              <SectionForm
                pageId={selectedPage.id}
                menus={menus}
                sectionKinds={sectionKinds}
              />

              {sections.length === 0 ? (
                <p className="py-12 text-center text-sm text-zinc-400">
                  이 페이지에 등록된 섹션이 없습니다.
                </p>
              ) : (
                <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
                  {sections.map((section) => (
                    <SectionItem
                      key={section.id}
                      section={section}
                      menus={menus}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
