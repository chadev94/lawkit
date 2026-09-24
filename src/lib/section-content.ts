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
  /** storage path 또는 `/` 로 시작하는 public 경로. 있으면 배경 이미지 대신 재생 */
  background_video: string;
  /** left 면 카피를 왼쪽에 두어 인물 배너(오른쪽)와 맞춘다 */
  text_align: "" | "left";
  /**
   * "bio" 면 약력 레이아웃(배지·직함·경력 목록·안내 박스).
   * 경력 줄은 page_section_items 로 두고, meta.highlight=true 면 강조 행.
   */
  variant: "" | "bio";
  /** 이름 옆 직함. 예: 대표변호사 */
  role: string;
  /** 빨간 배지. | 로 구분. 예: 형사재판센터|서울고등법원 재판연구원 출신 */
  badges: string;
  /** 주황 테두리 안내 한 줄 */
  info_box: string;
  /**
   * bio 전용. "section" 이면 뷰포트 전체 높이 대신 본문 블록 높이
   * (홈 2번째 섹션 등). 빈 값이면 풀 히어로.
   */
  density: "" | "section";
};

export type PageLinkContent = {
  /**
   * "story" — 리스트를 스크롤 스토리(글 고정 · 이미지 넘김)로 보인다.
   * "bands" — 업무분야형 가로 밴드(넓은 행). layout=bands 와 같다.
   * 빈 값이면 layout / source_page 슬러그로 결정.
   */
  variant: "" | "story" | "bands";
  /** false 면 연결 페이지 슬러그·더보기 링크를 숨긴다 (약력 등) */
  show_source: boolean;
  /** 해결사례 헤더 통계 한 줄. 예: 무죄 4건, 항소심 원심 파기 3건. 모두 2026년 선고입니다. */
  stats: string;
  /** stats 안에서 배지로 강조할 구절. | 로 구분. 예: 무죄 4건|항소심 원심 파기 3건 */
  stats_marks: string;
};

export type CtaContent = {
  badge: string;
  button_label: string;
};

export type ContactContent = {
  consent_label: string;
  submit_label: string;
  /** 접수 완료 대화창 제목 */
  success_message: string;
  /** 대화창 안내 한 줄. 예: 보통 영업일 기준 하루 안에 답합니다 */
  success_detail: string;
  /** 대화창 전화 버튼 번호. 비우면 버튼 없음 */
  success_phone: string;
};

export type YoutubeGalleryContent = {
  /** 하단 「더보기」 버튼 글자 */
  more_label: string;
  /** 하단 「더보기」 링크 (채널·페이지 URL 등) */
  more_href: string;
};

export type ClientReviewsContent = {
  /** 하단 고지. 예: 의뢰인 동의를 받아 게재했습니다. */
  note: string;
};

/**
 * page_section_items 를 쓰는 종류. 저장 액션·편집기 예비 입력이 이 목록을 본다.
 * (hero 는 variant=bio 일 때만 — 호출하는 쪽에서 따로 본다)
 * 새 종류에 항목을 붙이면 여기 한 줄만 추가한다. 빠지면 저장 때 항목이 지워진다.
 */
export const KINDS_WITH_ITEMS = [
  "page_link",
  "cta",
  "youtube_gallery",
  "news_room",
  "image_gallery",
  "client_reviews",
  "contact",
] as const;

export function kindHasItems(kind: string, content: Record<string, unknown> = {}): boolean {
  if (kind === "hero") return String(content.variant ?? "") === "bio";
  return (KINDS_WITH_ITEMS as readonly string[]).includes(kind);
}

export type SectionContentMap = {
  hero: HeroContent;
  page_link: PageLinkContent;
  cta: CtaContent;
  contact: ContactContent;
  youtube_gallery: YoutubeGalleryContent;
  client_reviews: ClientReviewsContent;
};

export const DEFAULT_HERO_CONTENT: HeroContent = {
  eyebrow: "YOO & PARTNERS",
  cta_label: "",
  cta_href: "",
  background_image: "",
  background_video: "",
  text_align: "",
  variant: "",
  role: "",
  badges: "",
  info_box: "",
  density: "",
};

export const DEFAULT_CTA_CONTENT: CtaContent = {
  badge: "YOUR SITUATION",
  button_label: "",
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  consent_label: "개인정보 수집·이용에 동의합니다",
  submit_label: "제출",
  success_message: "문의가 접수되었습니다.",
  success_detail: "변호사가 직접 연락드립니다. 보통 영업일 기준 하루 안에 답합니다.",
  success_phone: "",
};

export const DEFAULT_YOUTUBE_GALLERY_CONTENT: YoutubeGalleryContent = {
  more_label: "더보기 →",
  more_href: "",
};

export const DEFAULT_CLIENT_REVIEWS_CONTENT: ClientReviewsContent = {
  note: "의뢰인 동의를 받아 게재했습니다.",
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
    background_video: asString(o.background_video),
    text_align: o.text_align === "left" ? "left" : "",
    variant: o.variant === "bio" ? "bio" : "",
    role: asString(o.role),
    badges: asString(o.badges),
    info_box: asString(o.info_box),
    density: o.density === "section" ? "section" : "",
  };
}

/** 히어로 배지 문자열을 줄 배열로. 빈 칸은 버린다. */
export function splitHeroBadges(badges: string): string[] {
  return badges
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** 경력 항목 강조 여부 (meta.highlight). */
export function isBioItemHighlighted(meta: Record<string, unknown>): boolean {
  return meta.highlight === true || meta.highlight === "true";
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
    success_detail: asString(
      o.success_detail,
      DEFAULT_CONTACT_CONTENT.success_detail,
    ),
    success_phone: asString(o.success_phone).trim(),
  };
}

export function parseYoutubeGalleryContent(raw: unknown): YoutubeGalleryContent {
  const o = asRecord(raw);
  return {
    more_label: asString(
      o.more_label,
      DEFAULT_YOUTUBE_GALLERY_CONTENT.more_label,
    ),
    more_href: asString(o.more_href),
  };
}

export function parseClientReviewsContent(raw: unknown): ClientReviewsContent {
  const o = asRecord(raw);
  return {
    note: asString(o.note, DEFAULT_CLIENT_REVIEWS_CONTENT.note),
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
      return parsePageLinkContent(raw);
    case "youtube_gallery":
      return parseYoutubeGalleryContent(raw);
    case "client_reviews":
      return parseClientReviewsContent(raw);
    default:
      return {};
  }
}

export function parsePageLinkContent(raw: unknown): PageLinkContent {
  const o = asRecord(raw);
  const variant =
    o.variant === "story" ? "story" : o.variant === "bands" ? "bands" : "";
  return {
    variant,
    // 기본 true. 명시적으로 false 일 때만 숨김
    show_source: o.show_source !== false,
    stats: asString(o.stats),
    stats_marks: asString(o.stats_marks),
  };
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
        background_video: formData.get("content_background_video"),
        text_align: formData.get("content_text_align"),
        variant: formData.get("content_variant"),
        role: formData.get("content_role"),
        badges: formData.get("content_badges"),
        info_box: formData.get("content_info_box"),
        density: formData.get("content_density"),
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
        success_detail: formData.get("content_success_detail"),
        success_phone: formData.get("content_success_phone"),
      });
    case "page_link":
      return parsePageLinkContent({
        variant: (() => {
          const v = String(formData.get("content_variant") ?? "");
          if (v === "story" || v === "bands") return v;
          return "";
        })(),
        show_source: formData.get("content_show_source") !== "false",
        stats: formData.get("content_stats"),
        stats_marks: formData.get("content_stats_marks"),
      });
    case "youtube_gallery":
      return parseYoutubeGalleryContent({
        more_label: formData.get("content_more_label"),
        more_href: formData.get("content_more_href"),
      });
    case "client_reviews":
      return parseClientReviewsContent({
        note: formData.get("content_note"),
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
  // 앱 public/ 파일 또는 외부 URL은 그대로 쓴다.
  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${SECTION_MEDIA_BUCKET}/${path}`;
}
