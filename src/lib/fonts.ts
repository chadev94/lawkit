import {
  Geist,
  Geist_Mono,
  IBM_Plex_Sans_KR,
  Inter,
  Nanum_Gothic,
  Noto_Sans_KR,
} from "next/font/google";

/**
 * next/font 로 빌드 시 self-host. 런타임 Google Fonts CDN 요청을 없앤다.
 * 한국어 글꼴은 파일이 많아 preload: false.
 */

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const ibmPlexSansKr = IBM_Plex_Sans_KR({
  variable: "--font-ibm-plex-sans-kr",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const nanumGothic = Nanum_Gothic({
  variable: "--font-nanum-gothic",
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

/** root <html> className 에 합칠 변수 클래스 */
export const siteFontVariables = [
  geistSans.variable,
  geistMono.variable,
  inter.variable,
  notoSansKr.variable,
  ibmPlexSansKr.variable,
  nanumGothic.variable,
].join(" ");
