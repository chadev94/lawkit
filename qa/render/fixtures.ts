import type { PageSection, PageSectionItem } from "@/lib/sections";

/** 실제 DB 모양을 흉내 낸 최소 데이터. 값은 검사 목적에만 맞춘다. */
export function item(i: number, over: Partial<PageSectionItem> = {}): PageSectionItem {
  return {
    id: `item-${i}`,
    page_section_id: "sec-1",
    sort_order: i,
    title: `사례 ${i}`,
    subtitle: "1심 유죄 → 항소심 무죄",
    body: `서울고등법원 2026. 6. ${i + 1}. 본문 ${i}`,
    href: null,
    image_path: `seed/cases/0${i + 1}-card.jpg`,
    meta: {},
    is_active: true,
    ...over,
  };
}

export function section(over: Partial<PageSection> = {}): PageSection {
  return {
    id: "sec-1",
    page_id: "page-home",
    kind: "page_link",
    source_page_id: "page-cases",
    title: "해결사례",
    subtitle: "결과로 보여드립니다",
    layout: "cards",
    sort_order: 0,
    is_active: true,
    content: {},
    source_page: { id: "page-cases", title: "해결사례", slug: "cases" },
    section: { key: "page_link", name: "페이지 연결", requires_page: true },
    items: [item(0), item(1), item(2)],
    ...over,
  };
}
