import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/site/site-footer";
import {
  channelUrlError,
  normalizeChannelUrl,
  normalizeChannels,
  visibleChannels,
} from "@/lib/site-channels";
import { DEFAULT_COLORS, DEFAULT_CONTENT, DEFAULT_TYPOGRAPHY, type SiteSettings } from "@/lib/site-settings";

const settings = (channels: unknown): SiteSettings => ({
  id: "s",
  key: "default",
  colors: DEFAULT_COLORS,
  typography: DEFAULT_TYPOGRAPHY,
  content: {
    ...DEFAULT_CONTENT,
    site_name: "유앤파트너스",
    phone: "02-6214-1114",
    business_number: "471-47-01088",
    representative: "유환진",
    address: "",
    channels: normalizeChannels(channels),
  },
});

describe("채널 · 값 다루기", () => {
  it("https 없이 넣어도 붙이고, 빈 값은 빈 값", () => {
    expect(normalizeChannelUrl(" blog.naver.com/x ")).toBe("https://blog.naver.com/x");
    expect(normalizeChannelUrl("http://youtu.be/a")).toBe("http://youtu.be/a");
    expect(normalizeChannelUrl("")).toBe("");
  });

  it("그 서비스 주소가 아니면 거부, 빈 주소는 통과", () => {
    expect(channelUrlError("youtube", "https://www.instagram.com/x")).toMatch(/유튜브 주소가 아닙니다/);
    expect(channelUrlError("youtube", "https://youtu.be/abc")).toBeNull();
    expect(channelUrlError("naver_blog", "https://m.blog.naver.com/x")).toBeNull();
    expect(channelUrlError("kakao", "https://pf.kakao.com/_x")).toBeNull();
    expect(channelUrlError("kakao", "")).toBeNull();
    expect(channelUrlError("instagram", "https://not a url")).toMatch(/형식/);
  });

  it("저장된 순서를 지키고, 빠진 채널은 뒤에 붙이며, 모르는 키·중복은 버린다", () => {
    const list = normalizeChannels([
      { key: "youtube", url: "youtube.com/@a", enabled: false },
      { key: "kakao", url: "pf.kakao.com/_a" },
      { key: "kakao", url: "dup" },
      { key: "tiktok", url: "x" },
    ]);
    expect(list.map((c) => c.key)).toEqual(["youtube", "kakao", "naver_blog", "instagram"]);
    expect(list[0]).toEqual({ key: "youtube", url: "https://youtube.com/@a", enabled: false });
    expect(list[2]).toEqual({ key: "naver_blog", url: "", enabled: true });
  });

  it("사이트에 보이는 것 = 노출 켜짐 + 주소 있음", () => {
    const list = normalizeChannels([
      { key: "youtube", url: "youtube.com/@a", enabled: false },
      { key: "kakao", url: "pf.kakao.com/_a" },
    ]);
    expect(visibleChannels(list).map((c) => c.key)).toEqual(["kakao"]);
  });
});

describe("꼬리말 · 채널 로고", () => {
  it("관리자 순서대로 로고 링크가 나오고, 숨김·빈 채널은 빠진다", () => {
    const html = renderToStaticMarkup(
      <SiteFooter
        settings={settings([
          { key: "kakao", url: "pf.kakao.com/_a" },
          { key: "naver_blog", url: "blog.naver.com/a" },
          { key: "youtube", url: "youtube.com/@a", enabled: false },
        ])}
      />,
    );
    const order = [...html.matchAll(/data-field="channels\.([a-z_]+)"/g)].map((m) => m[1]);
    expect(order).toEqual(["kakao", "naver_blog"]);
    expect(html).toContain('aria-label="카카오톡 채널"');
    expect(html).toContain('target="_blank"');
  });

  it("채널이 하나도 없으면 줄 자체가 없다", () => {
    const html = renderToStaticMarkup(<SiteFooter settings={settings([])} />);
    expect(html).not.toContain('aria-label="채널"');
  });

  it("사업자등록번호·대표변호사도 이름과 값이 나뉜다 (전화 줄과 같은 규칙)", () => {
    const html = renderToStaticMarkup(<SiteFooter settings={settings([])} />);
    expect(html).toMatch(/<dt[^>]*>사업자등록번호<\/dt>\s*<dd[^>]*data-field="content.business_number"[^>]*>471-47-01088<\/dd>/);
    expect(html).toMatch(/<dt[^>]*>대표변호사<\/dt>\s*<dd[^>]*data-field="content.representative"[^>]*>유환진<\/dd>/);
  });
});
