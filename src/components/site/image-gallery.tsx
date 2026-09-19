import type { PageSection } from "@/lib/sections";
import { mediaPublicUrl } from "@/lib/section-content";
import { LightboxImage } from "@/components/site/image-lightbox";
import { Reveal } from "@/components/site/motion/reveal";

/**
 * 이미지 갤러리.
 * 모바일: 2열 격자 / md 이상: 가로 스크롤 리스트.
 * items.image_path = 사진, title = 캡션(선택), href = 링크(선택).
 * 사진 클릭은 확대 모달. href 가 있으면 캡션이 링크가 된다.
 */
export function ImageGallery({ section }: { section: PageSection }) {
  const items = section.items.filter((item) => mediaPublicUrl(item.image_path));

  return (
    <Reveal as="section" className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
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
        {section.subtitle && (
          <p
            data-field="subtitle"
            className="m-up mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground"
            style={{ "--m-i": 1 } as React.CSSProperties}
          >
            {section.subtitle}
          </p>
        )}

        {items.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            등록된 사진이 없습니다.
          </p>
        ) : (
          <>
            {/* 모바일: 격자 */}
            <ul
              className="m-up mt-10 grid grid-cols-2 gap-2 md:hidden"
              style={{ "--m-i": 2 } as React.CSSProperties}
            >
              {items.map((item, index) => (
                <GalleryCell key={item.id} item={item} index={index} />
              ))}
            </ul>

            {/* md+: 가로 리스트 */}
            <div
              className="m-up mt-10 hidden snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:flex [scrollbar-width:thin]"
              style={{ "--m-i": 2 } as React.CSSProperties}
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="w-[min(42%,18rem)] shrink-0 snap-start lg:w-72"
                >
                  <GalleryCell item={item} index={index} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Reveal>
  );
}

function GalleryCell({
  item,
  index,
}: {
  item: PageSection["items"][number];
  index: number;
}) {
  const src = mediaPublicUrl(item.image_path) ?? "";
  const href = item.href?.trim();
  const title = item.title?.trim();

  return (
    <figure data-item-no={index + 1} className="overflow-hidden rounded-lg bg-muted">
      <LightboxImage
        src={src}
        alt={title || ""}
        className="block w-full cursor-zoom-in border-0 bg-transparent p-0 transition-opacity hover:opacity-90"
        imgClassName="aspect-[4/5] w-full object-cover"
        loading={index < 4 ? "eager" : "lazy"}
      />
      {(title || href) && (
        <figcaption className="truncate px-2 py-2 text-xs text-muted-foreground">
          {href ? (
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              data-field={title ? `items.${index}.title` : undefined}
              className="hover:text-foreground"
            >
              {title || "바로가기"}
            </a>
          ) : (
            <span data-field={`items.${index}.title`}>{title}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
