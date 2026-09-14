import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import { siteSettingsToCssVars } from "@/lib/site-settings";

/**
 * 공개 사이트 ISR (Vercel CDN).
 * - revalidate 초 동안 엣지/서버 캐시 HIT
 * - 만료 후 stale-while-revalidate: 캐시 응답 후 백그라운드 재생성
 * - 어드민 저장 시 revalidateTag 로 즉시 무효화
 */
export const revalidate = PUBLIC_REVALIDATE_SECONDS;

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
      <div className="flex-1">{children}</div>
      <SiteFooter settings={settings} />
    </div>
  );
}
