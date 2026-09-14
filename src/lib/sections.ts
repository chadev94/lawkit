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
  requires_page: boolean;
  sort_order: number;
  is_active: boolean;
};

/** 라우팅되는 페이지. 헤더 네비게이션 항목 역할도 겸한다. */
export type SitePage = {
  id: string;
  slug: string;
  title: string;
  sort_order: number;
  is_active: boolean;
  show_in_nav: boolean;
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
  /** requires_page 인 종류에서 콘텐츠를 끌어올 페이지 */
  source_page_id: string | null;
  title: string | null;
  subtitle: string | null;
  layout: SectionLayout;
  sort_order: number;
  is_active: boolean;
  content: Record<string, unknown>;
  source_page: Pick<SitePage, "id" | "title" | "slug"> | null;
  section: Pick<Section, "key" | "name" | "requires_page"> | null;
  items: PageSectionItem[];
};

export const HOME_PAGE_SLUG = "home";

export const SECTION_LAYOUT_LABEL: Record<SectionLayout, string> = {
  cards: "카드",
  carousel: "캐러셀",
  list: "리스트",
};

export function pagePath(slug: string): string {
  return slug === HOME_PAGE_SLUG ? "/" : `/${slug}`;
}
