import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageLinkSection } from "@/components/site/page-link-section";
import type { SectionLayout } from "@/lib/sections";
import { section } from "./fixtures";

/**
 * 어드민 "표시 방식" 4가지가 각각 다른 화면을 만드는지.
 * 연결 페이지가 무엇이든(해결사례 / 업무분야) 결과가 같아야 한다 — 페이지 이름으로 모양을 강제하면 실패.
 */
const MARKER: Record<SectionLayout, RegExp> = {
  cards: /class="[^"]*\bm-card\b[^"]*"/,
  list: /class="[^"]*\bm-row\b[^"]*"/,
  carousel: /class="[^"]*\bm-carousel-track\b/,
  bands: /class="[^"]*\bm-bands\b/,
};
const LAYOUTS = Object.keys(MARKER) as SectionLayout[];

const SOURCES = [
  { id: "page-cases", title: "해결사례", slug: "cases" },
  { id: "page-practice", title: "업무분야", slug: "practice-areas" },
  { id: "page-lawyer", title: "구성원 소개", slug: "lawyer" },
];

describe("page_link · 표시 방식(layout)", () => {
  for (const source of SOURCES) {
    describe(`연결 페이지 = ${source.slug}`, () => {
      for (const layout of LAYOUTS) {
        it(`${layout} 를 고르면 ${layout} 로 그려진다`, () => {
          const html = renderToStaticMarkup(
            <PageLinkSection
              section={section({ layout, source_page: source, source_page_id: source.id })}
            />,
          );
          expect(html).toMatch(MARKER[layout]);
          // 다른 표시 방식의 표식은 없어야 한다
          for (const other of LAYOUTS) {
            if (other === layout) continue;
            // 캐러셀·밴드는 항목에 카드 요소를 쓴다 — cards 표식과의 충돌은 검사하지 않는다
            if (other === "cards" && (layout === "carousel" || layout === "bands")) continue;
            if (layout === "cards" && other === "bands") continue;
            expect(html, `${layout} 인데 ${other} 표식이 섞임`).not.toMatch(MARKER[other]);
          }
        });
      }
    });
  }

  it("네 가지 표시 방식은 서로 다른 HTML 을 만든다", () => {
    const outputs = LAYOUTS.map((layout) =>
      renderToStaticMarkup(<PageLinkSection section={section({ layout })} />),
    );
    expect(new Set(outputs).size).toBe(LAYOUTS.length);
  });
});

describe("page_link · 스크롤 스토리(content.variant=story)", () => {
  it("리스트 레이아웃에서 story 를 켜면 스토리로 바뀐다", () => {
    const off = renderToStaticMarkup(<PageLinkSection section={section({ layout: "list" })} />);
    const on = renderToStaticMarkup(
      <PageLinkSection section={section({ layout: "list", content: { variant: "story" } })} />,
    );
    expect(on).toMatch(/m-story/);
    expect(off).not.toMatch(/m-story/);
  });
});

describe("page_link · 항목 데이터가 화면에 나온다", () => {
  it("항목 제목·결과·법원·날짜", () => {
    const html = renderToStaticMarkup(<PageLinkSection section={section({ layout: "cards" })} />);
    expect(html).toContain("사례 0");
    expect(html).toContain("항소심 무죄");
    expect(html).toContain("서울고등법원");
    expect(html).toContain("2026. 6. 1.");
  });

  it("숨김 항목은 미리보기 쪽에서 걸러지므로 여기서는 전달된 항목만 그린다", () => {
    const html = renderToStaticMarkup(
      <PageLinkSection section={section({ items: [] })} />,
    );
    expect(html).toContain("등록된 항목이 없습니다");
  });
});
