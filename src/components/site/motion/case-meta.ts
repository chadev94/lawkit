import type { PageSectionItem } from "@/lib/sections";

/**
 * 사례 카드의 법원·선고일.
 * 어드민에서 입력한 meta.court / meta.date 를 먼저 쓰고, 없으면 본문 첫머리의
 * "서울고등법원 2026. 6. 4." 꼴에서 읽어낸다(초기 seed 가 이 형식이다).
 */
const COURT_DATE =
  /^(.+?(?:법원|지원|검찰청|위원회))\s*(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.?)\s*/;

export function caseMeta(item: PageSectionItem): {
  court: string | null;
  date: string | null;
  /** 법원·날짜를 떼어낸 본문 */
  body: string | null;
} {
  const meta = item.meta ?? {};
  const court =
    typeof meta.court === "string" && meta.court.trim()
      ? meta.court.trim()
      : null;
  const date =
    typeof meta.date === "string" && meta.date.trim() ? meta.date.trim() : null;
  const body = item.body ?? null;
  if (court || date || !body) return { court, date, body };

  const m = body.match(COURT_DATE);
  if (!m) return { court: null, date: null, body };
  return {
    court: m[1].trim(),
    date: m[2].trim(),
    body: body.slice(m[0].length).trim() || null,
  };
}
