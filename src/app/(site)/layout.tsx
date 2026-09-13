import { SiteHeader } from "@/components/site/site-header";

export const dynamic = "force-dynamic";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      {/* TODO: 푸터 (YP-7) */}
    </>
  );
}
