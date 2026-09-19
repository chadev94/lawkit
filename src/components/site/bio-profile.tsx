import Image from "next/image";
import type { PageSection } from "@/lib/sections";
import {
  isBioItemHighlighted,
  mediaPublicUrl,
  parseHeroContent,
  splitHeroBadges,
} from "@/lib/section-content";
import { Reveal } from "@/components/site/motion/reveal";

/**
 * 약력 블록 (yoopartnerslaw header.hero 레이아웃).
 * Hero content.variant === "bio" 일 때 홈·/lawyer 가 같이 쓴다.
 * density=section 이면 풀 뷰포트 대신 본문 블록 높이.
 */
export function BioProfile({ section }: { section: PageSection }) {
  const content = parseHeroContent(section.content);
  const backgroundImage = mediaPublicUrl(content.background_image);
  const badges = splitHeroBadges(content.badges);
  const items = section.items.filter((item) => item.is_active !== false);
  const isSection = content.density === "section";
  const name = section.title?.trim() || "변호사";

  return (
    <Reveal
      as="section"
      threshold={0.1}
      data-hero=""
      data-bio=""
      className={`relative flex overflow-hidden ${
        isSection
          ? "min-h-0 items-stretch"
          : "min-h-[var(--hero-min-height,100svh)] items-center"
      }`}
      style={{ background: "var(--hero-background)" }}
    >
      {backgroundImage && (
        <div className="m-clip absolute inset-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority={!isSection}
            sizes="100vw"
            className="object-cover object-right"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, color-mix(in srgb, var(--hero-background) 94%, transparent) 0%, color-mix(in srgb, var(--hero-background) 82%, transparent) 36%, color-mix(in srgb, var(--hero-background) 35%, transparent) 66%, transparent 100%)",
            }}
          />
        </div>
      )}

      <div
        className={`relative z-[1] mx-auto flex w-full max-w-6xl flex-col px-6 ${
          isSection ? "py-14 sm:py-16 md:py-20" : "py-24 sm:py-28"
        }`}
        style={{ "--m-base": "0.3s" } as React.CSSProperties}
      >
        {content.eyebrow && (
          <p
            data-field="content.eyebrow"
            className="m-up mb-7 text-center text-[0.7rem] font-medium tracking-[0.16em] sm:mb-9 sm:text-xs"
            style={
              {
                color: "var(--primary)",
                "--m-i": 0,
              } as React.CSSProperties
            }
          >
            {content.eyebrow}
          </p>
        )}

        <div className="w-full max-w-md text-left md:max-w-lg">
          {badges.length > 0 && (
            <div
              data-field="content.badges"
              className="m-up flex flex-col items-start gap-1.5"
              style={{ "--m-i": 1 } as React.CSSProperties}
            >
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-block px-2.5 py-1 text-[0.7rem] font-bold tracking-wide sm:text-xs"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          <h1
            data-field="title"
            className="m-mask mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1"
            style={
              {
                color: "var(--hero-foreground)",
                fontFamily: "var(--font-site-heading)",
                "--m-i": 2,
              } as React.CSSProperties
            }
          >
            <span className="text-4xl font-bold tracking-tight sm:text-5xl md:text-[3.15rem]">
              {name}
            </span>
            {content.role ? (
              <span
                data-field="content.role"
                className="text-base font-normal opacity-90 sm:text-lg"
              >
                {content.role}
              </span>
            ) : null}
          </h1>

          {section.subtitle && (
            <p
              data-field="subtitle"
              className="m-up mt-4 max-w-sm whitespace-pre-line text-[0.95rem] leading-relaxed opacity-90 sm:text-base"
              style={
                {
                  color: "var(--hero-foreground)",
                  "--m-i": 3,
                } as React.CSSProperties
              }
            >
              {section.subtitle}
            </p>
          )}

          {items.length > 0 && (
            <ul
              className="m-up mt-7 space-y-2.5"
              style={{ "--m-i": 4 } as React.CSSProperties}
            >
              {items.map((item, index) => {
                const highlighted = isBioItemHighlighted(item.meta ?? {});
                return (
                  <li
                    key={item.id}
                    data-field={`items.${index}`}
                    data-item-no={index + 1}
                    className={`flex items-stretch gap-3 text-sm sm:text-[0.9375rem] ${
                      highlighted ? "px-3 py-2 font-semibold" : ""
                    }`}
                    style={
                      highlighted
                        ? {
                            background: "var(--accent)",
                            color: "var(--hero-background)",
                          }
                        : { color: "var(--hero-foreground)" }
                    }
                  >
                    {!highlighted && (
                      <span
                        aria-hidden
                        className="mt-1.5 h-3.5 w-[3px] shrink-0 self-start"
                        style={{ background: "var(--primary)" }}
                      />
                    )}
                    <span data-field={`items.${index}.title`}>{item.title}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {content.info_box && (
            <p
              data-field="content.info_box"
              className="m-up mt-6 border px-4 py-3 text-center text-xs leading-relaxed sm:text-sm"
              style={
                {
                  borderColor: "var(--accent)",
                  color: "var(--hero-foreground)",
                  "--m-i": 5,
                } as React.CSSProperties
              }
            >
              {content.info_box}
            </p>
          )}

          {content.cta_label && content.cta_href && (
            <a
              data-field="content.cta_label"
              href={content.cta_href}
              className="m-up mt-6 flex w-full items-center justify-center rounded-md px-6 py-3.5 text-sm font-bold tracking-wide transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-110"
              style={
                {
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  "--m-i": 6,
                } as React.CSSProperties
              }
            >
              {content.cta_label}
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}
