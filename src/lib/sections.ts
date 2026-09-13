/**
 * 페이지 / 섹션 공유 타입.
 *
 * 섹션 종류(label)는 sections 테이블에서 조회한다.
 * 레이아웃 라벨만 코드에 남긴다.
 */

export type SectionLayout = "cards" | "carousel" | "list";

export type Section = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  requires_menu: boolean;
  sort_order: number;
  is_active: boolean;
};

export type SitePage = {
  id: string;
  slug: string;
  title: string;
  menu_id: string | null;
  sort_order: number;
  is_active: boolean;
};

export type PageSectionItem = {
  id: string;
  page_section_id: string;
  sort_order: number;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  href: string | null;
  image_path: string | null;
  meta: Record<string, unknown>;
  is_active: boolean;
};

export type PageSection = {
  id: string;
  page_id: string;
  kind: string;
  menu_id: string | null;
  title: string | null;
  subtitle: string | null;
  layout: SectionLayout;
  sort_order: number;
  is_active: boolean;
  content: Record<string, unknown>;
  menu: { id: string; name: string; slug: string } | null;
  section: Pick<Section, "key" | "name" | "requires_menu"> | null;
  items: PageSectionItem[];
};

/** @deprecated HomeSection → PageSection. 하위 호환용. */
export type HomeSection = PageSection;

export const HOME_PAGE_SLUG = "home";

export const SECTION_LAYOUT_LABEL: Record<SectionLayout, string> = {
  cards: "카드",
  carousel: "캐러셀",
  list: "리스트",
};

export function pagePath(slug: string): string {
  return slug === HOME_PAGE_SLUG ? "/" : `/${slug}`;
}
