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

describe("hero · 모바일 배경", () => {
  it("모바일본이 없으면 배경을 한 번만, 숨김 없이 그린다", () => {
    const html = renderToStaticMarkup(
      <Hero section={hero({ background_image: "/hero/pc.jpg" })} />,
    );
    expect(html).toContain("/hero/pc.jpg");
    expect(html).not.toContain("hidden md:block");
    expect(html).not.toContain("md:hidden");
  });

  it("모바일 이미지가 있으면 PC 는 md 이상, 모바일은 md 미만에 그린다", () => {
    const html = renderToStaticMarkup(
      <Hero
        section={hero({
          background_image: "/hero/pc.jpg",
          background_image_mobile: "/hero/mobile.jpg",
        })}
      />,
    );
    expect(html).toContain("/hero/pc.jpg");
    expect(html).toContain("/hero/mobile.jpg");
    expect(html).toContain("hidden md:block");
    expect(html).toContain("md:hidden");
  });

  it("모바일 영상이 비면 모바일 쪽도 PC 영상으로 폴백한다", () => {
    const html = renderToStaticMarkup(
      <Hero
        section={hero({
          background_video: "/hero/pc.mp4",
          background_image: "/hero/pc.jpg",
          background_image_mobile: "/hero/mobile.jpg",
        })}
      />,
    );
    // PC 쪽 1번 + 모바일 폴백 1번
    expect(html.match(/\/hero\/pc\.mp4/g)?.length).toBe(2);
  });

  it("PC 이미지 없이 모바일 이미지만 저장돼 있으면 무시한다", () => {
    const html = renderToStaticMarkup(
      <Hero section={hero({ background_image_mobile: "/hero/mobile.jpg" })} />,
    );
    expect(html).not.toContain("/hero/mobile.jpg");
  });
});
