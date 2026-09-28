import type { ChannelKey } from "@/lib/site-channels";

/**
 * 채널 로고. 각 서비스의 공식 색·마크를 인라인 SVG 로 그린다(외부 이미지 요청 없음).
 * 크기는 부모가 정한다(width/height 100%).
 */
export function ChannelLogo({ channel }: { channel: ChannelKey }) {
  switch (channel) {
    case "kakao":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="100%" height="100%">
          <rect width="24" height="24" rx="6" fill="#FEE500" />
          <path
            fill="#191919"
            d="M12 5.5c-4.1 0-7.4 2.6-7.4 5.8 0 2 1.3 3.8 3.3 4.8l-.7 2.7 3-2c.6.1 1.2.2 1.8.2 4.1 0 7.4-2.6 7.4-5.7S16.1 5.5 12 5.5z"
          />
        </svg>
      );
    case "naver_blog":
      // 네이버 블로그: 초록 바탕에 흰 말풍선, 그 안에 "b"
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="100%" height="100%">
          <rect width="24" height="24" rx="6" fill="#03C75A" />
          <path
            fill="#fff"
            d="M6.5 6.5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4.6L10 19.2V16.5H6.5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z"
          />
          <path
            fill="#03C75A"
            d="M9.4 8.6h1.5v2.2a2.2 2.2 0 0 1 1.5-.6c1.5 0 2.4 1.2 2.4 2.7s-.9 2.7-2.4 2.7c-.6 0-1.1-.2-1.5-.6v.5H9.4zm2.7 2.9c-.8 0-1.2.6-1.2 1.4s.4 1.4 1.2 1.4 1.2-.6 1.2-1.4-.4-1.4-1.2-1.4z"
          />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="100%" height="100%">
          <rect width="24" height="24" rx="6" fill="#FF0000" />
          <path
            fill="#fff"
            d="M19.6 8.4a2 2 0 0 0-1.4-1.4C17 6.7 12 6.7 12 6.7s-5 0-6.2.3a2 2 0 0 0-1.4 1.4C4 9.7 4 12 4 12s0 2.3.4 3.6a2 2 0 0 0 1.4 1.4c1.2.3 6.2.3 6.2.3s5 0 6.2-.3a2 2 0 0 0 1.4-1.4c.4-1.3.4-3.6.4-3.6s0-2.3-.4-3.6z"
          />
          <path fill="#FF0000" d="M10.4 14.4V9.6l4.2 2.4z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="100%" height="100%">
          <defs>
            <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
              <stop offset="0" stopColor="#FDF497" />
              <stop offset=".05" stopColor="#FDF497" />
              <stop offset=".45" stopColor="#FD5949" />
              <stop offset=".6" stopColor="#D6249F" />
              <stop offset=".9" stopColor="#285AEB" />
            </radialGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
          <rect
            x="5.5"
            y="5.5"
            width="13"
            height="13"
            rx="3.6"
            fill="none"
            stroke="#fff"
            strokeWidth="1.7"
          />
          <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.7" />
          <circle cx="16.1" cy="7.9" r=".95" fill="#fff" />
        </svg>
      );
  }
}
