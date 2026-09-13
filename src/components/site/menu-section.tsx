import type { PageSection } from "@/lib/sections";
import { mediaPublicUrl } from "@/lib/section-content";

/**
 * 메뉴에 연결된 콘텐츠 섹션.
 * 카드/리스트 항목은 page_section_items 에서 온다.
 */
export function MenuSection({ section }: { section: PageSection }) {
  const title = section.title ?? section.menu?.name ?? "";
  const slug = section.menu?.slug ?? "";
  const items = section.items;

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
            <a
              href={`/${slug}`}
              className="text-xs text-zinc-400 hover:text-zinc-900"
            >
              더보기 →
            </a>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-400">등록된 항목이 없습니다.</p>
        ) : section.layout === "list" ? (
          <ul className="mt-8 divide-y divide-zinc-100 border-y border-zinc-100">
            {items.map((item) => (
              <li key={item.id}>
                <ItemLink href={item.href} className="flex gap-4 py-4">
                  {item.image_path && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaPublicUrl(item.image_path) ?? ""}
                      alt=""
                      className="h-16 w-24 shrink-0 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {item.title ?? "제목 없음"}
                    </p>
                    {item.subtitle && (
                      <p className="mt-1 text-xs text-zinc-500">{item.subtitle}</p>
                    )}
                    {item.body && (
                      <p className="mt-1 text-xs text-zinc-400">{item.body}</p>
                    )}
                  </div>
                </ItemLink>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {items.map((item) => (
              <ItemLink
                key={item.id}
                href={item.href}
                className="overflow-hidden rounded-lg border border-zinc-200"
              >
                {item.image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaPublicUrl(item.image_path) ?? ""}
                    alt=""
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-zinc-50 text-xs text-zinc-300">
                    No image
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm font-medium text-zinc-900">
                    {item.title ?? "제목 없음"}
                  </p>
                  {item.subtitle && (
                    <p className="mt-1 text-xs text-zinc-500">{item.subtitle}</p>
                  )}
                  {item.body && (
                    <p className="mt-2 text-xs text-zinc-400 line-clamp-3">
                      {item.body}
                    </p>
                  )}
                </div>
              </ItemLink>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ItemLink({
  href,
  className,
  children,
}: {
  href: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
}
