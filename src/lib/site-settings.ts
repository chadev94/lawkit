/**
 * 사이트 전역 설정 (브랜드 / 타이포 / 공통 콘텐츠).
 * DB jsonb 스키마는 앱이 정의하고, 공개 사이트는 CSS 변수로 주입한다.
 */

export type SiteColors = {
  background: string;
  foreground: string;
  muted: string;
  muted_foreground: string;
  primary: string;
  primary_foreground: string;
  border: string;
  accent: string;
  hero_background: string;
  hero_foreground: string;
};

export type SiteTypography = {
  font_sans: string;
  font_heading: string;
};

export type SiteContent = {
  site_name: string;
  tagline: string;
  footer_text: string;
  /** 우편번호 검색으로 채우는 기본주소(도로명) */
  address: string;
  /** 층·호수 등 상세주소 */
  address_detail: string;
  phone: string;
  email: string;
  business_number: string;
  representative: string;
  privacy_policy_url: string;
};

export type SiteSettings = {
  id: string;
  key: string;
  colors: SiteColors;
  typography: SiteTypography;
  content: SiteContent;
};

export type FontOption = {
  id: string;
  label: string;
  /** CSS font-family 스택 (next/font CSS 변수) */
  family: string;
};

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "geist",
    label: "Geist (기본)",
    family: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: "inter",
    label: "Inter",
    family: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: "noto-sans-kr",
    label: "Noto Sans KR",
    family: "var(--font-noto-sans-kr), ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: "ibm-plex-sans-kr",
    label: "IBM Plex Sans KR",
    family:
      "var(--font-ibm-plex-sans-kr), ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: "nanum-gothic",
    label: "Nanum Gothic",
    family: "var(--font-nanum-gothic), ui-sans-serif, system-ui, sans-serif",
  },
];

export const DEFAULT_COLORS: SiteColors = {
  background: "#FFFFFF",
  foreground: "#1A1A1A",
  muted: "#FAFAF8",
  muted_foreground: "#4A4A4A",
  primary: "#D85A30",
  primary_foreground: "#FFFFFF",
  border: "#E8E4DF",
  accent: "#F0997B",
  hero_background: "#2C1A0C",
  hero_foreground: "#FFFFFF",
};

export const DEFAULT_TYPOGRAPHY: SiteTypography = {
  font_sans: "geist",
  font_heading: "geist",
};

export const DEFAULT_CONTENT: SiteContent = {
  site_name: "YOO & PARTNERS",
  tagline: "",
  footer_text: "",
  address: "",
  address_detail: "",
  phone: "",
  email: "",
  business_number: "",
  representative: "",
  privacy_policy_url: "",
};

export const COLOR_FIELDS: { key: keyof SiteColors; label: string }[] = [
  { key: "background", label: "배경" },
  { key: "foreground", label: "본문 글자" },
  { key: "muted", label: "연한 배경" },
  { key: "muted_foreground", label: "보조 글자" },
  { key: "primary", label: "버튼·강조 배경" },
  { key: "primary_foreground", label: "버튼 글자" },
  { key: "border", label: "테두리" },
  { key: "accent", label: "강조 글자 (작은 제목)" },
  { key: "hero_background", label: "첫 화면 배경" },
  { key: "hero_foreground", label: "첫 화면 글자" },
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const v = value.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)) return v;
  return fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export function parseColors(raw: unknown): SiteColors {
  const o = asRecord(raw);
  return {
    background: asColor(o.background, DEFAULT_COLORS.background),
    foreground: asColor(o.foreground, DEFAULT_COLORS.foreground),
    muted: asColor(o.muted, DEFAULT_COLORS.muted),
    muted_foreground: asColor(
      o.muted_foreground,
      DEFAULT_COLORS.muted_foreground,
    ),
    primary: asColor(o.primary, DEFAULT_COLORS.primary),
    primary_foreground: asColor(
      o.primary_foreground,
      DEFAULT_COLORS.primary_foreground,
    ),
    border: asColor(o.border, DEFAULT_COLORS.border),
    accent: asColor(o.accent, DEFAULT_COLORS.accent),
    hero_background: asColor(o.hero_background, DEFAULT_COLORS.hero_background),
    hero_foreground: asColor(o.hero_foreground, DEFAULT_COLORS.hero_foreground),
  };
}

export function parseTypography(raw: unknown): SiteTypography {
  const o = asRecord(raw);
  const ids = new Set(FONT_OPTIONS.map((f) => f.id));
  const fontSans = asString(o.font_sans, DEFAULT_TYPOGRAPHY.font_sans);
  const fontHeading = asString(o.font_heading, DEFAULT_TYPOGRAPHY.font_heading);
  return {
    font_sans: ids.has(fontSans) ? fontSans : DEFAULT_TYPOGRAPHY.font_sans,
    font_heading: ids.has(fontHeading)
      ? fontHeading
      : DEFAULT_TYPOGRAPHY.font_heading,
  };
}

export function parseContent(raw: unknown): SiteContent {
  const o = asRecord(raw);
  return {
    site_name: asString(o.site_name, DEFAULT_CONTENT.site_name),
    tagline: asString(o.tagline, DEFAULT_CONTENT.tagline),
    footer_text: asString(o.footer_text, DEFAULT_CONTENT.footer_text),
    address: asString(o.address, DEFAULT_CONTENT.address),
    address_detail: asString(o.address_detail, DEFAULT_CONTENT.address_detail),
    phone: asString(o.phone, DEFAULT_CONTENT.phone),
    email: asString(o.email, DEFAULT_CONTENT.email),
    business_number: asString(
      o.business_number,
      DEFAULT_CONTENT.business_number,
    ),
    representative: asString(o.representative, DEFAULT_CONTENT.representative),
    privacy_policy_url: asString(
      o.privacy_policy_url,
      DEFAULT_CONTENT.privacy_policy_url,
    ),
  };
}

export function normalizeSiteSettings(row: {
  id: string;
  key: string;
  colors: unknown;
  typography: unknown;
  content: unknown;
}): SiteSettings {
  return {
    id: row.id,
    key: row.key,
    colors: parseColors(row.colors),
    typography: parseTypography(row.typography),
    content: parseContent(row.content),
  };
}

export function getFontOption(id: string): FontOption {
  return FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0]!;
}

/** 공개 사이트 루트에 주입할 CSS 변수. */
export function siteSettingsToCssVars(
  settings: SiteSettings,
): Record<string, string> {
  const c = settings.colors;
  const sans = getFontOption(settings.typography.font_sans).family;
  const heading = getFontOption(settings.typography.font_heading).family;
  return {
    "--background": c.background,
    "--foreground": c.foreground,
    "--muted": c.muted,
    "--muted-foreground": c.muted_foreground,
    "--primary": c.primary,
    "--primary-foreground": c.primary_foreground,
    "--border": c.border,
    "--accent": c.accent,
    "--hero-background": c.hero_background,
    "--hero-foreground": c.hero_foreground,
    "--font-site-sans": sans,
    "--font-site-heading": heading,
  };
}

export function colorsFromFormData(formData: FormData): SiteColors {
  const raw: Record<string, unknown> = {};
  for (const { key } of COLOR_FIELDS) {
    raw[key] = formData.get(`color_${key}`);
  }
  return parseColors(raw);
}

export function typographyFromFormData(formData: FormData): SiteTypography {
  return parseTypography({
    font_sans: formData.get("font_sans"),
    font_heading: formData.get("font_heading"),
  });
}

export function contentFromFormData(formData: FormData): SiteContent {
  return parseContent({
    site_name: formData.get("site_name"),
    tagline: formData.get("tagline"),
    footer_text: formData.get("footer_text"),
    address: formData.get("address"),
    address_detail: formData.get("address_detail"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    business_number: formData.get("business_number"),
    representative: formData.get("representative"),
    privacy_policy_url: formData.get("privacy_policy_url"),
  });
}
