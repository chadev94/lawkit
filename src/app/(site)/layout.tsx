import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { siteSettingsToCssVars } from "@/lib/site-settings";

/**
 * 공개 사이트 ISR (Vercel CDN).
 * - revalidate 초 동안 엣지/서버 캐시 HIT
 * - 만료 후 stale-while-revalidate: 캐시 응답 후 백그라운드 재생성
 * - 어드민 저장 시 revalidateTag 로 즉시 무효화
 */
export const revalidate = 300;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const cssVars = siteSettingsToCssVars(settings);

  return (
    <div className="site-theme flex min-h-screen flex-col" style={cssVars}>
      <SiteHeader settings={settings} />
      {/* 고정 헤더 높이만큼 본문을 내린다. 히어로가 첫 자식이면 CSS :has 로 패딩을 없앤다. */}
      <div className="site-main flex-1">{children}</div>
      <SiteFooter settings={settings} />
    </div>
  );
}
