import { notFound } from "next/navigation";
import { PageSections } from "@/components/site/page-sections";
import { HOME_PAGE_SLUG } from "@/lib/sections";
import { getActivePageBySlug } from "@/lib/queries/pages";
import { getActivePageSections } from "@/lib/queries/page-sections";

export const revalidate = 300;

/**
 * pages.slug 에 대응하는 공개 페이지.
 * 홈(slug=home)은 / 로만 제공하므로 여기서는 404.
 */
export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === HOME_PAGE_SLUG) notFound();

  const page = await getActivePageBySlug(slug);
  if (!page) notFound();

  const sections = await getActivePageSections(page.id);
  return <PageSections sections={sections} />;
}
