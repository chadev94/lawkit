import type { PageSection, PageSectionItem } from "@/lib/sections";
import {
  mediaPublicUrl,
  parseClientReviewsContent,
} from "@/lib/section-content";
import { LightboxImage } from "@/components/site/image-lightbox";
import { Reveal } from "@/components/site/motion/reveal";

/**
 * 의뢰인 후기.
 * 참고: yoo-landing/hyeongsa `section.reviews` + `section.more-reviews`
 * - meta.role=featured: 사건명 + 캡처 + 결과 (가로 자동 스크롤)
 * - meta.role=grid: 추가 캡처 모자이크
 *
 * 마퀴는 동일 세트를 두 번 붙이고 translateX(-50%) 로 루프한다.
 * 세트마다 trailing gap(padding-right)을 두어 이음새가 끊기지 않게 한다.
 */
export function ClientReviews({ section }: { section: PageSection }) {
  const content = parseClientReviewsContent(section.content);
  const active = section.items.filter((item) => item.is_active !== false);

  const withImage = active.filter((item) => mediaPublicUrl(item.image_path));
  const featured = withImage.filter((item) => roleOf(item) === "featured");
  const grid = withImage.filter((item) => roleOf(item) === "grid");

  const cards =
    featured.length > 0
      ? featured
      : withImage.filter(
          (item) => item.title?.trim() || item.subtitle?.trim(),
        );
  const mosaic =
    grid.length > 0
      ? grid
      : withImage.filter((item) => !cards.includes(item));

  const columns = chunkColumns(mosaic, 4);

  return (
    <Reveal
      as="section"
      className="overflow-hidden py-16 sm:py-20"
      style={{ background: "#0a0a0a", color: "#fff" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        {section.title && (
          <h2
            data-field="title"
            className="m-mask text-center text-xl font-semibold tracking-tight sm:text-2xl"
            style={
              {
                fontFamily: "var(--font-site-heading)",
                "--m-i": 0,
              } as React.CSSProperties
            }
          >
            <span
              className="inline-block px-4 py-2"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {section.title}
            </span>
          </h2>
        )}
        {section.subtitle && (
          <p
            data-field="subtitle"
            className="m-up mt-4 text-center text-sm opacity-70"
            style={{ "--m-i": 1 } as React.CSSProperties}
          >
            {section.subtitle}
          </p>
        )}
      </div>

      {cards.length > 0 && (
        <div
          className="m-up reviews-marquee mt-10"
          style={{ "--m-i": 2 } as React.CSSProperties}
        >
          <div
            className="reviews-marquee-track"
            style={{ animationDuration: "40s" }}
          >
            {[0, 1].map((copy) => (
              <div
                key={`cards-${copy}`}
                className="reviews-marquee-group"
                aria-hidden={copy === 1 || undefined}
              >
                {cards.map((item, i) => {
                  const src = mediaPublicUrl(item.image_path)!;
                  return (
                    <article
                      key={`${item.id}-${copy}`}
                      data-field={copy === 0 ? `items.${i}.title` : undefined}
                      data-item-no={copy === 0 ? i + 1 : undefined}
                      className="reviews-featured-card"
                    >
                      {item.title && (
                        <div className="reviews-case-label">{item.title}</div>
                      )}
                      <div className="reviews-shot">
                        <LightboxImage
                          src={src}
                          alt=""
                          className="block w-full"
                          imgClassName="h-auto w-full object-contain"
                        />
                      </div>
                      {item.subtitle && (
                        <p
                          data-field={
                            copy === 0 ? `items.${i}.subtitle` : undefined
                          }
                          className="reviews-result"
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {columns.length > 0 && (
        <div
          className="m-up reviews-marquee mt-8"
          style={{ "--m-i": 3 } as React.CSSProperties}
        >
          <div
            className="reviews-marquee-track reviews-marquee-track--cols"
            style={{ animationDuration: "96s" }}
          >
            {[0, 1].map((copy) => (
              <div
                key={`cols-${copy}`}
                className="reviews-marquee-group reviews-marquee-group--cols"
                aria-hidden={copy === 1 || undefined}
              >
                {columns.map((col, colIndex) => (
                  <div
                    key={`col-${copy}-${colIndex}`}
                    className="reviews-mcol"
                  >
                    {col.map((item) => {
                      const src = mediaPublicUrl(item.image_path)!;
                      return (
                        <div
                          key={`${item.id}-${copy}`}
                          className="reviews-mitem"
                        >
                          {item.title && (
                            <div className="reviews-mlabel">{item.title}</div>
                          )}
                          <LightboxImage
                            src={src}
                            alt=""
                            className="block w-full"
                            imgClassName="h-auto w-full rounded-sm object-contain"
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {content.note && (
        <p
          data-field="content.note"
          className="m-up mx-auto mt-8 max-w-6xl px-6 text-center text-xs opacity-50"
          style={{ "--m-i": 4 } as React.CSSProperties}
        >
          {content.note}
        </p>
      )}

      {cards.length + mosaic.length === 0 && (
        <p className="mt-10 text-center text-sm opacity-60">
          등록된 후기가 없습니다.
        </p>
      )}
    </Reveal>
  );
}

function roleOf(item: PageSectionItem): "featured" | "grid" | "" {
  const role = item.meta?.role;
  if (role === "featured" || role === "grid") return role;
  return "";
}

function chunkColumns(
  items: PageSectionItem[],
  perCol: number,
): PageSectionItem[][] {
  const cols: PageSectionItem[][] = [];
  for (let i = 0; i < items.length; i += perCol) {
    cols.push(items.slice(i, i + perCol));
  }
  return cols;
}
