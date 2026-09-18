import type { PageSection } from "@/lib/sections";
import { mediaPublicUrl, parsePageLinkContent } from "@/lib/section-content";
import { LightboxImage } from "@/components/site/image-lightbox";
import { Carousel } from "@/components/site/motion/carousel";
import { ResultText, splitResult } from "@/components/site/motion/result";
import { Reveal } from "@/components/site/motion/reveal";
import { StoryScroller } from "@/components/site/motion/story";
import { caseMeta } from "@/components/site/motion/case-meta";

/**
 * 다른 페이지에 연결된 콘텐츠 섹션. 제목·경로는 연결된 페이지에서 온다.
 * 카드/리스트 항목은 page_section_items 에서 온다.
 *
 * 움직임(globals.css .m-*):
 *   리스트  — 행이 순서대로 올라오고 결과("→ 뒤")에 밑줄이 그려진다
 *   카드    — 호버 시 사진이 어두워지며 결과가 올라온다
 *   캐러셀  — 손으로 좌우 스크롤·드래그. 해결사례는 헤더+통계 배지
 *   밴드    — 업무분야형 가로 행(번호·영문 라벨·국문 제목·상담 CTA)
 *   스토리  — content.variant === "story": 글 고정 · 이미지 넘김 (리스트 대신)
 */
export function PageLinkSection({ section }: { section: PageSection }) {
  const title = section.title ?? section.source_page?.title ?? "";
  const slug = section.source_page?.slug ?? "";
  const items = section.items;
  const { variant, show_source, stats, stats_marks } = parsePageLinkContent(
    section.content,
  );
  const isCarousel = section.layout === "carousel";
  const isBands =
    !isCarousel &&
    variant !== "story" &&
    (section.layout === "bands" ||
      variant === "bands" ||
      slug === "practice-areas");

  if (isBands) {
    return (
      <BandsSection
        section={section}
        title={title}
        slug={slug}
        items={items}
      />
    );
  }

  return (
    <Reveal
      as="section"
      className={`border-b border-border/60 py-20 ${
        isCarousel ? "m-cases-band overflow-hidden" : ""
      }`}
    >
      <div className="mx-auto max-w-5xl px-6">
        <div
          className={
            isCarousel ? "text-center" : "flex items-end justify-between"
          }
        >
          <div className={isCarousel ? "mx-auto max-w-2xl" : undefined}>
            {show_source && slug && !isCarousel && (
              <p
                className="m-up text-xs tracking-[0.2em] text-accent"
                style={mi(0)}
              >
                {slug.toUpperCase()}
              </p>
            )}
            <h2
              data-field="title"
              className={`m-mask mt-2 font-semibold text-foreground ${
                isCarousel ? "text-2xl sm:text-3xl" : "text-2xl"
              }`}
              style={mi(1)}
            >
              <span>{title}</span>
            </h2>
            {section.subtitle && (
              <p
                data-field="subtitle"
                className={`m-up mt-2 text-sm ${
                  isCarousel
                    ? "text-base font-medium text-foreground/90"
                    : "text-muted-foreground"
                }`}
                style={mi(2)}
              >
                {section.subtitle}
              </p>
            )}
            {stats && (
              <p
                data-field="content.stats"
                className="m-up m-stats mt-4 text-sm leading-relaxed text-foreground/85"
                style={mi(3)}
              >
                <StatsLine text={stats} marks={stats_marks} />
              </p>
            )}
          </div>

          {show_source && slug && !isCarousel && (
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
            {items.map((item, index) => {
              const thumb = mediaPublicUrl(item.image_path);
              return (
                <li
                  key={item.id}
                  data-field={`items.${index}`}
                  data-item-no={index + 1}
                  className="m-row relative"
                  style={mi(index)}
                >
                  <div className="flex gap-4 py-4">
                    {thumb && (
                      <LightboxImage
                        src={thumb}
                        alt={item.title ?? ""}
                        className="h-16 w-24 shrink-0 cursor-zoom-in overflow-hidden rounded border-0 bg-transparent p-0"
                        imgClassName="h-full w-full object-cover"
                      />
                    )}
                    <ItemLink href={item.href} className="min-w-0 flex-1">
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
                          className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
                        >
                          {item.body}
                        </p>
                      )}
                    </ItemLink>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : isCarousel ? (
          <div className="m-carousel-bleed">
            <Carousel ariaLabel={title}>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  data-field={`items.${index}`}
                  data-item-no={index + 1}
                  className="m-card m-card-case"
                >
                  <CaseCardBody item={item} index={index} />
                </div>
              ))}
            </Carousel>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                data-field={`items.${index}`}
                data-item-no={index + 1}
                className="m-card m-up"
                style={mi(index + 2)}
              >
                <CardBody item={item} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  );
}

/** 업무분야형 가로 밴드. yoopartnerslaw 레퍼런스. */
function BandsSection({
  section,
  title,
  slug,
  items,
}: {
  section: PageSection;
  title: string;
  slug: string;
  items: PageSection["items"];
}) {
  const eyebrow = (slug || "practice-areas").replace(/-/g, " ").toUpperCase();

  return (
    <Reveal as="section" className="m-bands border-b border-border/40 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <header className="m-bands-head">
          <p className="m-up m-bands-eyebrow" style={mi(0)}>
            <span>{eyebrow}</span>
            <span className="m-bands-eyebrow-rule" aria-hidden />
          </p>
          <h2 data-field="title" className="m-mask m-bands-title" style={mi(1)}>
            <span>{title || "업무분야"}</span>
          </h2>
          <span className="m-bands-underline" aria-hidden />
          {section.subtitle && (
            <p
              data-field="subtitle"
              className="m-up m-bands-lead"
              style={mi(2)}
            >
              {section.subtitle}
            </p>
          )}
        </header>

        {items.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">
            등록된 항목이 없습니다.
          </p>
        ) : (
          <ul className="m-bands-list">
            {items.map((item, index) => {
              const label = (item.subtitle ?? "").trim();
              const showLabel =
                Boolean(label) && label !== (item.title ?? "").trim();
              const href = item.href?.trim() || "#contact";
              const num = String(index + 1).padStart(2, "0");
              const bg = mediaPublicUrl(item.image_path);
              return (
                <li
                  key={item.id}
                  data-field={`items.${index}`}
                  data-item-no={index + 1}
                  className="m-bands-row m-up"
                  style={mi(index + 2)}
                >
                  {bg && (
                    <span
                      className="m-bands-bg"
                      style={{ backgroundImage: `url(${bg})` }}
                      aria-hidden
                    />
                  )}
                  <span className="m-bands-shade" aria-hidden />
                  <span className="m-bands-accent" aria-hidden />
                  <div className="m-bands-body">
                    <span className="m-bands-index" aria-hidden>
                      {num}
                    </span>
                    {showLabel && (
                      <p
                        data-field={`items.${index}.subtitle`}
                        className="m-bands-label"
                      >
                        {/^[A-Za-z]/.test(label)
                          ? label.toUpperCase()
                          : label}
                      </p>
                    )}
                    <h3
                      data-field={`items.${index}.title`}
                      className="m-bands-name"
                    >
                      {item.title ?? "제목 없음"}
                    </h3>
                    {item.body && (
                      <p
                        data-field={`items.${index}.body`}
                        className="m-bands-desc"
                      >
                        {item.body}
                      </p>
                    )}
                    <a href={href} className="m-bands-cta">
                      상담 신청 <span aria-hidden>›</span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Reveal>
  );
}

/** stats 문장에서 marks 구절을 찾아 배지로 감싼다. */
function StatsLine({ text, marks }: { text: string; marks: string }) {
  const needles = marks
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  if (needles.length === 0) return <>{text}</>;

  const pattern = new RegExp(
    `(${needles.map(escapeRegExp).join("|")})`,
    "g",
  );
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        needles.includes(part) ? (
          <mark key={`${part}-${i}`} className="m-stat-badge">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 캐러셀용 해결사례 카드.
 * 상단: 죄명 헤더 → 결과 패널(글 배경) → 판결문 이미지(확대 가능).
 */
function CaseCardBody({
  item,
  index,
}: {
  item: PageSection["items"][number];
  index: number;
}) {
  const { court, date, body } = caseMeta(item);
  const res = splitResult(item.subtitle);
  const metaLine = [court, date].filter(Boolean).join(" · ");
  const badge = res?.to?.replace(/^항소심\s*/, "").trim() || null;
  const src = mediaPublicUrl(item.image_path);

  return (
    <>
      <div data-field={`items.${index}.title`} className="m-card-head">
        {item.title ?? "사건"}
      </div>
      <div className="m-card-result">
        {item.subtitle && (
          <p
            data-field={`items.${index}.subtitle`}
            className="m-card-result-line"
          >
            <ResultText text={item.subtitle} />
          </p>
        )}
        {badge && <span className="m-card-badge">{badge}</span>}
        {(body || metaLine) && (
          <p data-field={`items.${index}.body`} className="m-card-result-meta">
            {metaLine}
            {metaLine && body ? " · " : ""}
            {body}
          </p>
        )}
      </div>
      <div className="m-card-pic m-card-pic-doc">
        {src ? (
          <LightboxImage
            src={src}
            alt={item.title ?? ""}
            className="block h-full w-full cursor-zoom-in border-0 bg-transparent p-0"
          />
        ) : (
          <div className="m-card-noimg">판결문</div>
        )}
      </div>
    </>
  );
}

/**
 * 카드 한 장(그리드용).
 * 사진(4:3) 위에 법원·선고일 오버레이만 둔다.
 */
function CardBody({
  item,
  index,
}: {
  item: PageSection["items"][number];
  index: number;
}) {
  const { court, date, body } = caseMeta(item);
  const metaLine = [court, date].filter(Boolean).join(" · ");
  const src = mediaPublicUrl(item.image_path);
  const text = (
    <>
      <p data-field={`items.${index}.title`} className="m-card-title">
        {item.title ?? "제목 없음"}
      </p>
      {body && (
        <p data-field={`items.${index}.body`} className="m-card-body">
          {body}
        </p>
      )}
    </>
  );

  return (
    <>
      <div className="m-card-pic">
        {src ? (
          <LightboxImage
            src={src}
            alt={item.title ?? ""}
            className="block h-full w-full cursor-zoom-in border-0 bg-transparent p-0"
          />
        ) : (
          <div className="m-card-noimg">{item.title ?? ""}</div>
        )}
        {metaLine && <span className="m-court">{metaLine}</span>}
      </div>
      {item.href ? (
        <a
          href={item.href}
          className="m-card-txt block text-inherit no-underline"
        >
          {text}
        </a>
      ) : (
        <div className="m-card-txt">{text}</div>
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
