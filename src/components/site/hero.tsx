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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={background}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      )}
      <div className="relative mx-auto w-full max-w-5xl px-6 py-24">
        <p
          className="text-xs tracking-[0.3em]"
          style={{ color: "var(--accent)" }}
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
            className="mt-4 max-w-md text-sm"
            style={{ color: "var(--accent)" }}
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
