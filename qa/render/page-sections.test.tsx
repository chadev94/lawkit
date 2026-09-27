import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageSections } from "@/components/site/page-sections";
import { section } from "./fixtures";

/** 블록 순서·종류·숨김이 화면에 그대로 반영되는지 */
describe("page_sections · 순서와 종류", () => {
  it("sort_order 대로 위에서 아래로 그린다", () => {
    const a = section({ id: "a", title: "첫째", sort_order: 0 });
    const b = section({ id: "b", title: "둘째", sort_order: 1 });
    const html = renderToStaticMarkup(<PageSections sections={[a, b]} />);
    expect(html.indexOf("첫째")).toBeLessThan(html.indexOf("둘째"));
    const swapped = renderToStaticMarkup(<PageSections sections={[b, a]} />);
    expect(swapped.indexOf("둘째")).toBeLessThan(swapped.indexOf("첫째"));
  });

  it("모르는 종류(kind)는 조용히 건너뛴다", () => {
    const html = renderToStaticMarkup(
      <PageSections sections={[section({ kind: "does_not_exist" })]} />,
    );
    expect(html).not.toContain("해결사례");
  });

  it("빈 목록은 안내 문구", () => {
    const html = renderToStaticMarkup(<PageSections sections={[]} />);
    expect(html).toContain("등록된 섹션이 없습니다");
  });
});
