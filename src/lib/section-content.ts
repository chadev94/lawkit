/**
 * kind별 섹션 content / items 스키마.
 * DB jsonb 는 유연하고, 검증·기본값은 앱이 담당한다.
 */

export type SectionItemInput = {
  id?: string;
  sort_order: number;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  href: string | null;
  image_path: string | null;
  meta?: Record<string, unknown>;
  is_active?: boolean;
};

export type HeroContent = {
  eyebrow: string;
  cta_label: string;
  cta_href: string;
  background_image: string;
};

export type PageLinkContent = Record<string, never>;

export type CtaContent = {
  badge: string;
  button_label: string;
};

export type ContactContent = {
  consent_label: string;
  submit_label: string;
  success_message: string;
};

export type SectionContentMap = {
  hero: HeroContent;
  page_link: PageLinkContent;
  cta: CtaContent;
  contact: ContactContent;
};

export const DEFAULT_HERO_CONTENT: HeroContent = {
  eyebrow: "YOO & PARTNERS",
  cta_label: "",
  cta_href: "",
  background_image: "",
};

export const DEFAULT_CTA_CONTENT: CtaContent = {
  badge: "YOUR SITUATION",
  button_label: "",
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  consent_label: "개인정보 수집·이용에 동의합니다",
  submit_label: "제출",
  success_message: "문의가 접수되었습니다.",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function parseHeroContent(raw: unknown): HeroContent {
  const o = asRecord(raw);
  return {
    eyebrow: asString(o.eyebrow, DEFAULT_HERO_CONTENT.eyebrow),
    cta_label: asString(o.cta_label),
    cta_href: asString(o.cta_href),
    background_image: asString(o.background_image),
  };
}

export function parseCtaContent(raw: unknown): CtaContent {
  const o = asRecord(raw);
  return {
    badge: asString(o.badge, DEFAULT_CTA_CONTENT.badge),
    button_label: asString(o.button_label),
  };
}

export function parseContactContent(raw: unknown): ContactContent {
  const o = asRecord(raw);
  return {
    consent_label: asString(
      o.consent_label,
      DEFAULT_CONTACT_CONTENT.consent_label,
    ),
    submit_label: asString(
      o.submit_label,
      DEFAULT_CONTACT_CONTENT.submit_label,
    ),
    success_message: asString(
      o.success_message,
      DEFAULT_CONTACT_CONTENT.success_message,
    ),
  };
}

export function parseContentForKind(
  kind: string,
  raw: unknown,
): Record<string, unknown> {
  switch (kind) {
    case "hero":
      return parseHeroContent(raw);
    case "cta":
      return parseCtaContent(raw);
    case "contact":
      return parseContactContent(raw);
    case "page_link":
    default:
      return {};
  }
}

/** FormData 의 content_* 필드를 kind별 content 객체로 모은다. */
export function contentFromFormData(
  kind: string,
  formData: FormData,
): Record<string, unknown> {
  switch (kind) {
    case "hero":
      return parseHeroContent({
        eyebrow: formData.get("content_eyebrow"),
        cta_label: formData.get("content_cta_label"),
        cta_href: formData.get("content_cta_href"),
        background_image: formData.get("content_background_image"),
      });
    case "cta":
      return parseCtaContent({
        badge: formData.get("content_badge"),
        button_label: formData.get("content_button_label"),
      });
    case "contact":
      return parseContactContent({
        consent_label: formData.get("content_consent_label"),
        submit_label: formData.get("content_submit_label"),
        success_message: formData.get("content_success_message"),
      });
    default:
      return {};
  }
}

/** FormData items_json → SectionItemInput[] */
export function itemsFromFormData(formData: FormData): SectionItemInput[] {
  const raw = String(formData.get("items_json") ?? "[]");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed.map((row, index) => {
    const o = asRecord(row);
    return {
      id: typeof o.id === "string" ? o.id : undefined,
      sort_order:
        typeof o.sort_order === "number" ? o.sort_order : index,
      title: typeof o.title === "string" && o.title.trim() ? o.title.trim() : null,
      subtitle:
        typeof o.subtitle === "string" && o.subtitle.trim()
          ? o.subtitle.trim()
          : null,
      body: typeof o.body === "string" && o.body.trim() ? o.body.trim() : null,
      href: typeof o.href === "string" && o.href.trim() ? o.href.trim() : null,
      image_path:
        typeof o.image_path === "string" && o.image_path.trim()
          ? o.image_path.trim()
          : null,
      meta: asRecord(o.meta),
      is_active: o.is_active !== false,
    };
  });
}

export const SECTION_MEDIA_BUCKET = "section-media";

export function mediaPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${SECTION_MEDIA_BUCKET}/${path}`;
}
