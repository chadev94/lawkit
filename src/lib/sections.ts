/**
 * 섹션 타입과 라벨.
 *
 * Client Component 에서도 쓰므로 서버 전용 코드(supabase/server 등)를
 * import 하지 않는다. 조회 함수는 queries/home-sections.ts 에 있다.
 */

export type SectionKind = "hero" | "menu" | "cta" | "contact";
export type SectionLayout = "cards" | "carousel" | "list";

export type HomeSection = {
  id: string;
  kind: SectionKind;
  menu_id: string | null;
  title: string | null;
  subtitle: string | null;
  layout: SectionLayout;
  sort_order: number;
  is_active: boolean;
  /** kind === "menu" 일 때 조인된 메뉴 */
  menu: { id: string; name: string; slug: string } | null;
};

export const SECTION_KIND_LABEL: Record<SectionKind, string> = {
  hero: "히어로",
  menu: "메뉴 연결",
  cta: "상담 진단",
  contact: "상담 문의 폼",
};

export const SECTION_LAYOUT_LABEL: Record<SectionLayout, string> = {
  cards: "카드",
  carousel: "캐러셀",
  list: "리스트",
};
