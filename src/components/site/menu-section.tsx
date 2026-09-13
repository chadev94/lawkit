import type { Menu } from "@/lib/queries/menus";

/**
 * menus 테이블에 등록된 항목 하나가 메인 페이지의 섹션 하나가 된다.
 *
 * 지금은 제목만 DB에서 오고 내용은 빈 카드다.
 * 각 섹션의 실제 콘텐츠(해결사례, 업무분야 등)는 전용 테이블이 생기면 붙인다.
 */
export function MenuSection({ menu }: { menu: Menu }) {
  return (
    <section className="border-b border-zinc-100 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-zinc-400">
              {menu.slug.toUpperCase()}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
              {menu.name}
            </h2>
          </div>

          <a
            href={`/${menu.slug}`}
            className="text-xs text-zinc-400 hover:text-zinc-900"
          >
            더보기 →
          </a>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-200 text-xs text-zinc-300"
            >
              콘텐츠 영역
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
