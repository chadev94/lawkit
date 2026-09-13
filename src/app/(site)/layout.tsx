import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getSiteSettings } from "@/lib/queries/site-settings";
import {
  googleFontsHref,
  siteSettingsToCssVars,
} from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const cssVars = siteSettingsToCssVars(settings);
  const fontsHref = googleFontsHref(settings.typography);

  return (
    <div className="site-theme flex min-h-screen flex-col" style={cssVars}>
      {fontsHref && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link rel="stylesheet" href={fontsHref} />
        </>
      )}
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
