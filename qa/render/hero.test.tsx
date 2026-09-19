import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/site/hero";
import { section } from "./fixtures";

const hero = (content: Record<string, unknown>) =>
  section({
    kind: "hero",
    source_page: null,
    source_page_id: null,
    title: "판사 옆에서 3년",
    subtitle: "경찰 연락을 받았다면",
    items: [],
    section: { key: "hero", name: "히어로", requires_page: false },
    content,
  });

describe("hero · 어드민 값 반영", () => {
  it("제목·부제·작은 제목·버튼 글자가 그대로 나온다", () => {
    const html = renderToStaticMarkup(
      <Hero
        section={hero({
          eyebrow: "YOO & PARTNERS",
          cta_label: "무료 전화상담",
          cta_href: "tel:02-000-0000",
        })}
      />,
    );
    expect(html).toContain("판사 옆에서 3년");
    expect(html).toContain("경찰 연락을 받았다면");
    expect(html).toContain("YOO &amp; PARTNERS");
    expect(html).toContain("무료 전화상담");
    expect(html).toContain('href="tel:02-000-0000"');
  });

  it("버튼 글자나 링크가 비면 버튼을 그리지 않는다", () => {
    const html = renderToStaticMarkup(<Hero section={hero({ cta_label: "", cta_href: "" })} />);
    expect(html).not.toMatch(/href="tel:/);
  });

  it("variant=bio 는 약력 레이아웃으로 바뀐다", () => {
    const plain = renderToStaticMarkup(<Hero section={hero({})} />);
    const bio = renderToStaticMarkup(<Hero section={hero({ variant: "bio" })} />);
    expect(bio).not.toBe(plain);
  });
});
