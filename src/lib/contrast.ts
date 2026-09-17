/**
 * WCAG 2.1 대비 계산. 서버·클라이언트 어디서나 쓴다(의존성 없음).
 *
 * 기준: 본문 4.5:1, 큰 글씨(18px+ 또는 14px 굵게) 3:1.
 * 이 사이트는 의뢰인 부모 세대가 볼 가능성이 높아 본문 기준을 기본으로 둔다.
 */

import type { SiteColors } from "@/lib/site-settings";

export const AA_TEXT = 4.5;
export const AA_LARGE = 3;

function channel(hex: string, at: number): number {
  const v = parseInt(hex.slice(at, at + 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** #rgb / #rrggbb 를 받아 상대 휘도를 돌려준다. 형식이 틀리면 null. */
export function luminance(hex: string): number | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return 0.2126 * channel(h, 0) + 0.7152 * channel(h, 2) + 0.0722 * channel(h, 4);
}

/** 두 색의 대비 비율. 형식이 틀리면 null. */
export function contrastRatio(a: string, b: string): number | null {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type ContrastCheck = {
  /** 사람이 읽는 이름. "본문 글자 / 배경" */
  label: string;
  fg: keyof SiteColors;
  bg: keyof SiteColors;
  /** 통과 기준 */
  need: number;
};

/**
 * 사이트에서 실제로 글자가 놓이는 조합만 검사한다.
 * 컴포넌트가 바뀌어 새 조합이 생기면 여기에 추가한다.
 */
export const SITE_CONTRAST_CHECKS: ContrastCheck[] = [
  { label: "본문 글자 / 배경", fg: "foreground", bg: "background", need: AA_TEXT },
  { label: "보조 글자 / 배경", fg: "muted_foreground", bg: "background", need: AA_TEXT },
  { label: "보조 글자 / 연한 배경", fg: "muted_foreground", bg: "muted", need: AA_TEXT },
  { label: "강조 글자 / 배경", fg: "accent", bg: "background", need: AA_TEXT },
  { label: "버튼 글자 / 버튼", fg: "primary_foreground", bg: "primary", need: AA_TEXT },
  { label: "첫 화면 글자 / 첫 화면 배경", fg: "hero_foreground", bg: "hero_background", need: AA_TEXT },
];

export type ContrastResult = ContrastCheck & {
  ratio: number | null;
  pass: boolean;
};

export function checkSiteContrast(colors: SiteColors): ContrastResult[] {
  return SITE_CONTRAST_CHECKS.map((check) => {
    const ratio = contrastRatio(colors[check.fg], colors[check.bg]);
    return { ...check, ratio, pass: ratio !== null && ratio >= check.need };
  });
}

/** 소수 첫째 자리까지 "4.5:1" 꼴로 */
export function formatRatio(ratio: number | null): string {
  return ratio === null ? "—" : `${ratio.toFixed(1)}:1`;
}
