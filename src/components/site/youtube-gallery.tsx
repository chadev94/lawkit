import type { PageSection } from "@/lib/sections";
import { parseYoutubeGalleryContent } from "@/lib/section-content";
import {
  parseYouTubeId,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/youtube";
import { Reveal } from "@/components/site/motion/reveal";

/**
 * 유튜브 링크 가로 갤러리.
 * 도아 「도아의 변호사들」 영역처럼 썸네일 + 제목 스크롤, 하단 더보기.
 * items.href = 유튜브 URL, items.title = 표시 제목.
 */
export function YoutubeGallery({ section }: { section: PageSection }) {
  const content = parseYoutubeGalleryContent(section.content);
  const videos = section.items
    .map((item) => {
      const id = parseYouTubeId(item.href);
      if (!id) return null;
      return {
        key: item.id,
        id,
        title: item.title?.trim() || "영상",
        href: youtubeWatchUrl(id),
        thumb: youtubeThumbnailUrl(id),
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  const moreHref = content.more_href.trim();
  const moreLabel = content.more_label.trim() || "더보기 →";

  return (
    <Reveal
      as="section"
      className="py-20"
      style={{ background: "color-mix(in srgb, var(--primary) 6%, var(--background))" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6">
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

        {videos.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            등록된 영상이 없습니다.
          </p>
        ) : (
          <div
            className="m-up -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 [scrollbar-width:thin]"
            style={{ "--m-i": 1 } as React.CSSProperties}
          >
            {videos.map((video, index) => (
              <a
                key={video.key}
                href={video.href}
                target="_blank"
                rel="noopener noreferrer"
                data-field={`items.${index}.title`}
                data-item-no={index + 1}
                className="group w-[min(72vw,18rem)] shrink-0 snap-start sm:w-72"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- YouTube CDN 썸네일 */}
                <img
                  src={video.thumb}
                  alt=""
                  width={480}
                  height={360}
                  className="aspect-video w-full rounded-xl object-cover shadow-sm transition-[transform,box-shadow] group-hover:-translate-y-0.5 group-hover:shadow-md"
                  loading={index < 2 ? "eager" : "lazy"}
                />
                <p className="mt-3 line-clamp-3 text-left text-sm leading-relaxed text-foreground/85">
                  {video.title}
                </p>
              </a>
            ))}
          </div>
        )}

        {moreHref && (
          <div
            className="m-up flex justify-center"
            style={{ "--m-i": 2 } as React.CSSProperties}
          >
            <a
              data-field="content.more_label"
              href={moreHref}
              target={moreHref.startsWith("http") ? "_blank" : undefined}
              rel={moreHref.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold tracking-wide transition-[transform,opacity] hover:-translate-y-0.5"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {moreLabel}
            </a>
          </div>
        )}
      </div>
    </Reveal>
  );
}
