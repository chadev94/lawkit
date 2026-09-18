import Image from "next/image";
import type { PageSection } from "@/lib/sections";
import { mediaPublicUrl, parseHeroContent } from "@/lib/section-content";
import { BioProfile } from "@/components/site/bio-profile";
import { Reveal } from "@/components/site/motion/reveal";

/**
 * 첫 화면 히어로.
 * variant=bio 이면 약력 레이아웃(BioProfile) — 홈 2번째·/lawyer 가 공유한다.
 * text_align=left 이면 카피를 왼쪽에 두어 인물 배너(오른쪽)와 맞춘다.
 * 어드민 미리보기는 `--hero-min-height` 로 높이를 덮는다.
 */
export function Hero({ section }: { section: PageSection }) {
  const content = parseHeroContent(section.content);
  if (content.variant === "bio") {
    return <BioProfile section={section} />;
  }

  const backgroundImage = mediaPublicUrl(content.background_image);
  const backgroundVideo = mediaPublicUrl(content.background_video);
  const hasMedia = Boolean(backgroundVideo || backgroundImage);
  const alignLeft = content.text_align === "left";

  return (
    <Reveal
      as="section"
      threshold={0.1}
      data-hero=""
      className={`relative flex min-h-[var(--hero-min-height,100svh)] overflow-hidden ${
        alignLeft ? "items-center justify-start" : "items-center justify-center"
      }`}
      style={{ background: "var(--hero-background)" }}
    >
      {backgroundVideo && (
        <div className="m-clip absolute inset-0">
          <video
            className={`absolute inset-0 h-full w-full object-cover ${
              alignLeft ? "object-right" : ""
            }`}
            src={backgroundVideo}
            poster={backgroundImage ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: alignLeft
                ? "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.2) 100%)"
                : "rgba(0,0,0,0.45)",
            }}
          />
        </div>
      )}

      {!backgroundVideo && backgroundImage && (
        <div className="m-clip absolute inset-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className={`object-cover ${alignLeft ? "object-right" : ""}`}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: alignLeft
                ? "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.2) 100%)"
                : "rgba(0,0,0,0.45)",
            }}
          />
        </div>
      )}

      {!hasMedia && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 45%)",
          }}
        />
      )}

      <div
        className={`relative z-[1] w-full px-6 py-28 sm:py-32 ${
          alignLeft
            ? "mx-0 max-w-xl text-left md:ml-[max(1.5rem,calc((100%-72rem)/2+1.5rem))] md:max-w-lg"
            : "mx-auto max-w-3xl text-center"
        }`}
        style={{ "--m-base": "0.35s" } as React.CSSProperties}
      >
        <p
          data-field="content.eyebrow"
          className="m-up text-xs font-medium tracking-[0.25em]"
          style={
            {
              color: "color-mix(in srgb, var(--accent) 85%, var(--hero-foreground))",
              "--m-i": 0,
            } as React.CSSProperties
          }
        >
          {content.eyebrow || "YOO & PARTNERS"}
        </p>
        <h1
          data-field="title"
          className="m-mask mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.45]"
          style={
            {
              color: "var(--hero-foreground)",
              fontFamily: "var(--font-site-heading)",
              "--m-i": 1,
            } as React.CSSProperties
          }
        >
          <span>{section.title ?? "히어로 카피"}</span>
        </h1>
        {section.subtitle && (
          <p
            data-field="subtitle"
            className={`m-up mt-6 text-base leading-relaxed opacity-70 sm:text-lg ${
              alignLeft ? "max-w-md" : "mx-auto max-w-lg"
            }`}
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
            className="m-up mt-10 inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold tracking-wide transition-[transform,box-shadow] hover:-translate-y-0.5"
            style={
              {
                background: "var(--primary)",
                color: "var(--primary-foreground)",
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
