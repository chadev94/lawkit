import { getAllMenus } from "@/lib/queries/menus";
import { getAllSections } from "@/lib/queries/home-sections";
import { SECTION_KIND_LABEL, SECTION_LAYOUT_LABEL } from "@/lib/sections";
import { SectionForm } from "./section-form";
import { toggleSection, deleteSection } from "./actions";

export const dynamic = "force-dynamic";

export default async function SectionsPage() {
  const [sections, menus] = await Promise.all([getAllSections(), getAllMenus()]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">메인 페이지 구성</h1>
        <p className="mt-1 text-sm text-zinc-500">
          등록한 섹션이 순서대로 메인 페이지에 표시됩니다.
        </p>
      </div>

      <SectionForm menus={menus} />

      {sections.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-400">
          등록된 섹션이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
          {sections.map((section) => (
            <li key={section.id} className="flex items-center gap-4 px-4 py-3">
              <span className="w-8 text-xs text-zinc-400">
                {section.sort_order}
              </span>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">
                    {SECTION_KIND_LABEL[section.kind]}
                  </span>
                  <p className="text-sm font-medium">
                    {section.title ?? section.menu?.name ?? "—"}
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {section.kind === "menu"
                    ? `/${section.menu?.slug ?? "?"} · ${SECTION_LAYOUT_LABEL[section.layout]}`
                    : section.subtitle ?? ""}
                </p>
              </div>

              <form
                action={async () => {
                  "use server";
                  await toggleSection(section.id, !section.is_active);
                }}
              >
                <button
                  type="submit"
                  className={`rounded px-2 py-1 text-xs ${
                    section.is_active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {section.is_active ? "노출중" : "숨김"}
                </button>
              </form>

              <form
                action={async () => {
                  "use server";
                  await deleteSection(section.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs text-zinc-400 hover:text-red-600"
                >
                  삭제
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
