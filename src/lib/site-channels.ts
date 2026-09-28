/**
 * 채널 링크(카카오톡 채널 · 네이버 블로그 · 유튜브 · 인스타그램).
 *
 * site_settings.content.channels 에 순서 있는 배열로 산다: [{ key, url, enabled }].
 * 관리자가 정하는 것은 주소 · 순서 · 노출 여부 셋. 로고·크기·위치는 코드가 고정한다.
 * 채널 종류는 넷으로 고정. 늘리려면 CHANNEL_KEYS 와 CHANNEL_META 에 한 줄씩.
 *
 * 이 파일은 브라우저·서버·테스트 어디서나 돈다.
 */

export const CHANNEL_KEYS = ["kakao", "naver_blog", "youtube", "instagram"] as const;
export type ChannelKey = (typeof CHANNEL_KEYS)[number];

export type SiteChannel = {
  key: ChannelKey;
  url: string;
  enabled: boolean;
};

export const CHANNEL_META: Record<
  ChannelKey,
  { label: string; placeholder: string; hosts: string[] }
> = {
  kakao: {
    label: "카카오톡 채널",
    placeholder: "pf.kakao.com/_xaBcDe",
    hosts: ["pf.kakao.com", "open.kakao.com"],
  },
  naver_blog: {
    label: "네이버 블로그",
    placeholder: "blog.naver.com/아이디",
    hosts: ["blog.naver.com", "m.blog.naver.com"],
  },
  youtube: {
    label: "유튜브",
    placeholder: "youtube.com/@채널",
    hosts: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
  },
  instagram: {
    label: "인스타그램",
    placeholder: "instagram.com/아이디",
    hosts: ["instagram.com", "www.instagram.com"],
  },
};

function isChannelKey(value: unknown): value is ChannelKey {
  return typeof value === "string" && (CHANNEL_KEYS as readonly string[]).includes(value);
}

/** "blog.naver.com/x" 처럼 https 없이 붙여 넣어도 받는다. 빈 값은 빈 값. */
export function normalizeChannelUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * 그 서비스 주소가 맞는지. 유튜브 칸에 인스타 주소를 넣는 실수를 막는다.
 * 빈 주소는 오류가 아니다(아직 안 넣은 것). 오류면 사람에게 보여줄 문장을 돌려준다.
 */
export function channelUrlError(key: ChannelKey, url: string): string | null {
  if (url === "") return null;
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "주소 형식이 아닙니다.";
  }
  const ok = CHANNEL_META[key].hosts.some((h) => host === h || host.endsWith(`.${h}`));
  return ok ? null : `${CHANNEL_META[key].label} 주소가 아닙니다.`;
}

/**
 * DB 값 → 항상 네 채널이 한 번씩, 저장된 순서대로. 빠진 채널은 뒤에 붙는다(주소 없음 · 노출).
 * 모르는 키나 중복은 버린다.
 */
export function normalizeChannels(raw: unknown): SiteChannel[] {
  const out: SiteChannel[] = [];
  const seen = new Set<ChannelKey>();
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const o = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      if (!isChannelKey(o.key) || seen.has(o.key)) continue;
      seen.add(o.key);
      out.push({
        key: o.key,
        url: normalizeChannelUrl(o.url),
        enabled: o.enabled !== false,
      });
    }
  }
  for (const key of CHANNEL_KEYS) {
    if (!seen.has(key)) out.push({ key, url: "", enabled: true });
  }
  return out;
}

/** 사이트에 실제로 보일 것: 노출 켜짐 + 주소 있음. 순서 유지. */
export function visibleChannels(channels: SiteChannel[]): SiteChannel[] {
  return channels.filter((c) => c.enabled && c.url !== "");
}
