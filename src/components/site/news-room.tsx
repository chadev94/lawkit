import type { PageSection } from "@/lib/sections";
import { mediaPublicUrl } from "@/lib/section-content";
import { LightboxImage } from "@/components/site/image-lightbox";
import { Reveal } from "@/components/site/motion/reveal";

/**
 * 뉴스 기사 리스트.
 * 도아 「뉴스룸」처럼 카테고리 + 제목 행.
 * items.subtitle = 카테고리, title = 제목, href = 링크, image_path = 썸네일(선택).
 * 썸네일 클릭은 확대 모달, 제목은 기사 링크로 이동.
 */
export function NewsRoom({ section }: { section: PageSection }) {
  const items = section.items.filter(
    (item) => item.title?.trim() || item.href?.trim(),
  );

  return (
    <Reveal
      as="section"
      className="py-20"
      style={{
        background: "color-mix(in srgb, var(--muted) 70%, var(--background))",
      }}
    >
      <div className="mx-auto flex max-w-xl flex-col gap-8 px-6">
        {section.title && (
          <h2
            data-field="title"
            className="m-mask text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            style={
              {
                fontFamily: "var(--font-site-heading)",
                "--m-i": 0,
              } as React.CSSProperties
            }
          >
            <span>{section.title}</span>
          </h2>
        )}

        <div
          className="m-up rounded-2xl p-4 sm:p-5"
          style={
            {
              background: "color-mix(in srgb, var(--background) 88%, transparent)",
              "--m-i": 1,
            } as React.CSSProperties
          }
        >
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              등록된 기사가 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item, index) => {
                const category = item.subtitle?.trim() || "뉴스";
                const title = item.title?.trim() || "기사 제목";
                const href = item.href?.trim();
                const thumb = mediaPublicUrl(item.image_path);
                const copy = (
                  <>
                    <span
                      data-field={`items.${index}.subtitle`}
                      className="text-xs font-semibold tracking-wide"
                      style={{ color: "var(--primary)" }}
                    >
                      {category}
                    </span>
                    <span
                      data-field={`items.${index}.title`}
                      className="mt-1 block truncate text-sm font-medium text-foreground"
                    >
                      {title}
                    </span>
                  </>
                );

                return (
                  <li key={item.id}>
                    <div
                      data-item-no={index + 1}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-[transform,background] hover:-translate-y-0.5 sm:px-5 sm:py-4"
                      style={{
                        background:
                          "color-mix(in srgb, var(--primary) 8%, var(--background))",
                      }}
                    >
                      {thumb && (
                        <LightboxImage
                          src={thumb}
                          alt={title}
                          className="h-14 w-20 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border-0 bg-transparent p-0"
                          imgClassName="h-full w-full object-cover"
                          loading={index < 3 ? "eager" : "lazy"}
                        />
                      )}
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel={
                            href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="min-w-0 flex-1"
                        >
                          {copy}
                        </a>
                      ) : (
                        <div className="min-w-0 flex-1">{copy}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Reveal>
  );
}
