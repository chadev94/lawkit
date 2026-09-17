import Image from "next/image";
import type { PageSection } from "@/lib/sections";
import { mediaPublicUrl, parseHeroContent } from "@/lib/section-content";
import { Reveal } from "@/components/site/motion/reveal";

export function Hero({ section }: { section: PageSection }) {
  const content = parseHeroContent(section.content);
  const background = mediaPublicUrl(content.background_image);

  // 움직임: 배경 사진이 왼쪽에서 걷히고(1), 글이 순서대로 올라온다(2). 한 번만.
  return (
    <Reveal
      as="section"
      threshold={0.1}
      className="relative flex min-h-[var(--hero-min-height,60vh)] items-center overflow-hidden"
      style={{ background: "var(--hero-background)" }}
    >
      {background && (
        <div className="m-clip absolute inset-0">
          {/* 사진은 원본 색 그대로 두고, 텍스트 가독성은 테마와 무관한 스크림이 담당한다 */}
          <Image
            src={background}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-black/40" />
        </div>
      )}
      <div
        className="relative mx-auto w-full max-w-5xl px-6 py-24"
        style={{ "--m-base": "0.35s" } as React.CSSProperties}
      >
        <p
          data-field="content.eyebrow"
          className="m-up text-xs tracking-[0.3em] opacity-70"
          style={
            {
              color: "var(--hero-foreground)",
              "--m-i": 0,
            } as React.CSSProperties
          }
        >
          {content.eyebrow || "YOO & PARTNERS"}
        </p>
        <h1
          data-field="title"
          className="m-mask mt-4 line-clamp-3 text-3xl font-semibold leading-tight sm:text-4xl"
          style={
            {
              color: "var(--hero-foreground)",
              "--m-i": 1,
            } as React.CSSProperties
          }
        >
          <span>{section.title ?? "히어로 카피"}</span>
        </h1>
        {section.subtitle && (
          <p
            data-field="subtitle"
            className="m-up mt-4 line-clamp-4 max-w-md text-sm opacity-80"
            style={
              {
                color: "var(--hero-foreground)",
                "--m-i": 2,
              } as React.CSSProperties
            }
          >
            {section.subtitle}
          </p>
        )}
        {content.cta_label && content.cta_href && (
          <a
            data-field="content.cta_label"
            href={content.cta_href}
            className="m-up mt-8 inline-block rounded px-5 py-2 text-sm font-medium"
            style={
              {
                background: "var(--primary-foreground)",
                color: "var(--primary)",
                "--m-i": 3,
              } as React.CSSProperties
            }
          >
            {content.cta_label}
          </a>
        )}
      </div>
    </Reveal>
  );
}
