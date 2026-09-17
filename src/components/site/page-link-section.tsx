import type { PageSection } from "@/lib/sections";
import { mediaPublicUrl, parsePageLinkContent } from "@/lib/section-content";
import { Carousel } from "@/components/site/motion/carousel";
import { ResultText } from "@/components/site/motion/result";
import { Reveal } from "@/components/site/motion/reveal";
import { StoryScroller } from "@/components/site/motion/story";

/**
 * 다른 페이지에 연결된 콘텐츠 섹션. 제목·경로는 연결된 페이지에서 온다.
 * 카드/리스트 항목은 page_section_items 에서 온다.
 *
 * 움직임(globals.css .m-*):
 *   리스트  — 행이 순서대로 올라오고 결과("→ 뒤")에 밑줄이 그려진다
 *   카드    — 호버 시 사진이 어두워지며 결과가 올라온다
 *   캐러셀  — 손으로 끌어 넘긴다
 *   스토리  — content.variant === "story": 글 고정 · 이미지 넘김 (리스트 대신)
 */
export function PageLinkSection({ section }: { section: PageSection }) {
  const title = section.title ?? section.source_page?.title ?? "";
  const slug = section.source_page?.slug ?? "";
  const items = section.items;
  const { variant } = parsePageLinkContent(section.content);

  return (
    <Reveal as="section" className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <p
              className="m-up text-xs tracking-[0.2em] text-accent"
              style={mi(0)}
            >
              {slug.toUpperCase()}
            </p>
            <h2
              data-field="title"
              className="m-mask mt-2 text-2xl font-semibold text-foreground"
              style={mi(1)}
            >
              <span>{title}</span>
            </h2>
            {section.subtitle && (
              <p
                data-field="subtitle"
                className="m-up mt-2 text-sm text-muted-foreground"
                style={mi(2)}
              >
                {section.subtitle}
              </p>
            )}
          </div>

          {slug && (
            <a
              href={`/${slug}`}
              className="m-up text-xs text-muted-foreground hover:text-foreground"
              style={mi(2)}
            >
              더보기 →
            </a>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            등록된 항목이 없습니다.
          </p>
        ) : variant === "story" ? (
          <StoryScroller items={items} />
        ) : section.layout === "list" ? (
          <ul className="mt-8 divide-y divide-border/60 border-y border-border/60">
            {items.map((item, index) => (
              <li
                key={item.id}
                data-field={`items.${index}`}
                data-item-no={index + 1}
                className="m-row relative"
                style={mi(index)}
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
                        className="mt-1 text-xs"
                      >
                        <ResultText text={item.subtitle} />
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
        ) : section.layout === "carousel" ? (
          <Carousel ariaLabel={title}>
            {items.map((item, index) => (
              <ItemLink
                key={item.id}
                href={item.href}
                data-field={`items.${index}`}
                data-item-no={index + 1}
                className="m-card relative overflow-hidden rounded-lg border border-border bg-background"
              >
                <CardBody item={item} index={index} />
              </ItemLink>
            ))}
          </Carousel>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {items.map((item, index) => (
              <ItemLink
                key={item.id}
                href={item.href}
                data-field={`items.${index}`}
                data-item-no={index + 1}
                className="m-card m-up relative overflow-hidden rounded-lg border border-border"
                style={mi(index + 2)}
              >
                <CardBody item={item} index={index} />
              </ItemLink>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  );
}

/** 카드 한 장. 사진 위에 결과·제목이 올라온다(호버). 폰에서는 항상 보인다. */
function CardBody({
  item,
  index,
}: {
  item: PageSection["items"][number];
  index: number;
}) {
  return (
    <>
      {item.image_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaPublicUrl(item.image_path) ?? ""}
          alt=""
          className="h-56 w-full object-cover object-top"
        />
      ) : (
        <div className="flex h-56 items-center justify-center bg-muted text-xs text-muted-foreground/60">
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
          <p data-field={`items.${index}.subtitle`} className="mt-1 text-xs">
            <ResultText text={item.subtitle} />
          </p>
        )}
      </div>
      {(item.body || item.subtitle) && (
        <div className="m-card-veil">
          {item.subtitle && (
            <p className="text-xs font-semibold">{item.subtitle}</p>
          )}
          {item.body && (
            <p
              data-field={`items.${index}.body`}
              className="mt-1 line-clamp-3 text-xs opacity-90"
            >
              {item.body}
            </p>
          )}
        </div>
      )}
    </>
  );
}

/** 형제 순서(--m-i). CSS 가 이 값으로 지연을 준다. */
function mi(i: number): React.CSSProperties {
  return { "--m-i": i } as React.CSSProperties;
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
