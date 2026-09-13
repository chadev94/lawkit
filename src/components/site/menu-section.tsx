import type { HomeSection } from "@/lib/sections";

/**
 * 메뉴에 연결된 콘텐츠 섹션.
 *
 * 지금은 제목만 DB에서 오고 내용은 빈 자리다.
 * 각 메뉴의 실제 콘텐츠(해결사례, 업무분야 등)는 전용 테이블이 생기면 붙인다.
 */
export function MenuSection({ section }: { section: HomeSection }) {
  const title = section.title ?? section.menu?.name ?? "";
  const slug = section.menu?.slug ?? "";

  return (
    <section className="border-b border-zinc-100 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-zinc-400">
              {slug.toUpperCase()}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-900">{title}</h2>
            {section.subtitle && (
              <p className="mt-2 text-sm text-zinc-500">{section.subtitle}</p>
            )}
          </div>

          {slug && (
            <a href={`/${slug}`} className="text-xs text-zinc-400 hover:text-zinc-900">
              더보기 →
            </a>
          )}
        </div>

        <div
          className={
            section.layout === "list"
              ? "mt-8 divide-y divide-zinc-100 border-y border-zinc-100"
              : "mt-8 grid gap-4 sm:grid-cols-3"
          }
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={
                section.layout === "list"
                  ? "flex h-16 items-center text-xs text-zinc-300"
                  : "flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-200 text-xs text-zinc-300"
              }
            >
              콘텐츠 영역
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
