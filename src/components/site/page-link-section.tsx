import type { PageSection } from "@/lib/sections";
import { mediaPublicUrl } from "@/lib/section-content";

/**
 * 다른 페이지에 연결된 콘텐츠 섹션. 제목·경로는 연결된 페이지에서 온다.
 * 카드/리스트 항목은 page_section_items 에서 온다.
 */
export function PageLinkSection({ section }: { section: PageSection }) {
  const title = section.title ?? section.source_page?.title ?? "";
  const slug = section.source_page?.slug ?? "";
  const items = section.items;

  return (
    <section className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-accent">
              {slug.toUpperCase()}
            </p>
            <h2 data-field="title" className="mt-2 text-2xl font-semibold text-foreground">
              {title}
            </h2>
            {section.subtitle && (
              <p data-field="subtitle" className="mt-2 text-sm text-muted-foreground">
                {section.subtitle}
              </p>
            )}
          </div>

          {slug && (
            <a
              href={`/${slug}`}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              더보기 →
            </a>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">등록된 항목이 없습니다.</p>
        ) : section.layout === "list" ? (
          <ul className="mt-8 divide-y divide-border/60 border-y border-border/60">
            {items.map((item, index) => (
              <li
                key={item.id}
                data-field={`items.${index}`}
                data-item-no={index + 1}
                className="relative"
              >
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
                    <p
                      data-field={`items.${index}.title`}
                      className="text-sm font-medium text-foreground"
                    >
                      {item.title ?? "제목 없음"}
                    </p>
                    {item.subtitle && (
                      <p
                        data-field={`items.${index}.subtitle`}
                        className="mt-1 text-xs text-muted-foreground"
                      >
                        {item.subtitle}
                      </p>
                    )}
                    {item.body && (
                      <p
                        data-field={`items.${index}.body`}
                        className="mt-1 text-xs text-muted-foreground/80"
                      >
                        {item.body}
                      </p>
                    )}
                  </div>
                </ItemLink>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {items.map((item, index) => (
              <ItemLink
                key={item.id}
                href={item.href}
                data-field={`items.${index}`}
                data-item-no={index + 1}
                className="relative overflow-hidden rounded-lg border border-border"
              >
                {item.image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaPublicUrl(item.image_path) ?? ""}
                    alt=""
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-muted text-xs text-muted-foreground/60">
                    No image
                  </div>
                )}
                <div className="p-4">
                  <p
                    data-field={`items.${index}.title`}
                    className="text-sm font-medium text-foreground"
                  >
                    {item.title ?? "제목 없음"}
                  </p>
                  {item.subtitle && (
                    <p
                      data-field={`items.${index}.subtitle`}
                      className="mt-1 text-xs text-muted-foreground"
                    >
                      {item.subtitle}
                    </p>
                  )}
                  {item.body && (
                    <p
                      data-field={`items.${index}.body`}
                      className="mt-2 text-xs text-muted-foreground/80 line-clamp-3"
                    >
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
  ...rest
}: {
  href: string | null;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  if (href) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}
