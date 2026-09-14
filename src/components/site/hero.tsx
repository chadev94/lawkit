import Image from "next/image";
import type { PageSection } from "@/lib/sections";
import { mediaPublicUrl, parseHeroContent } from "@/lib/section-content";

export function Hero({ section }: { section: PageSection }) {
  const content = parseHeroContent(section.content);
  const background = mediaPublicUrl(content.background_image);

  return (
    <section
      className="relative flex min-h-[60vh] items-center overflow-hidden"
      style={{ background: "var(--hero-background)" }}
    >
      {background && (
        <>
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
        </>
      )}
      <div className="relative mx-auto w-full max-w-5xl px-6 py-24">
        <p
          className="text-xs tracking-[0.3em] opacity-70"
          style={{ color: "var(--hero-foreground)" }}
        >
          {content.eyebrow || "YOO & PARTNERS"}
        </p>
        <h1
          className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl"
          style={{ color: "var(--hero-foreground)" }}
        >
          {section.title ?? "히어로 카피"}
        </h1>
        {section.subtitle && (
          <p
            className="mt-4 max-w-md text-sm opacity-80"
            style={{ color: "var(--hero-foreground)" }}
          >
            {section.subtitle}
          </p>
        )}
        {content.cta_label && content.cta_href && (
          <a
            href={content.cta_href}
            className="mt-8 inline-block rounded px-5 py-2 text-sm font-medium"
            style={{
              background: "var(--primary-foreground)",
              color: "var(--primary)",
            }}
          >
            {content.cta_label}
          </a>
        )}
      </div>
    </section>
  );
}
