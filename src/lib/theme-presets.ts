import { parseColors, type SiteColors } from "@/lib/site-settings";

/**
 * 테마 프리셋 (theme_presets 테이블).
 * 어드민에서 선택하면 colors 가 site_settings.colors 로 복사된다.
 */

export type ThemePreset = {
  id: string;
  slug: string;
  label: string;
  description: string;
  colors: SiteColors;
  is_default: boolean;
};

export function normalizeThemePreset(row: {
  id: string;
  slug: string;
  label: string;
  description: string;
  colors: unknown;
  is_default: boolean;
}): ThemePreset {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    description: row.description,
    colors: parseColors(row.colors),
    is_default: row.is_default,
  };
}

/** 현재 색상이 프리셋과 완전히 일치하는지 (선택 표시용). */
export function colorsMatchPreset(
  colors: SiteColors,
  preset: ThemePreset,
): boolean {
  return (Object.keys(preset.colors) as (keyof SiteColors)[]).every(
    (key) => colors[key].toLowerCase() === preset.colors[key].toLowerCase(),
  );
}
