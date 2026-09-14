import { notFound } from "next/navigation";
import { PageSections } from "@/components/site/page-sections";
import { PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import { getHomePage } from "@/lib/queries/pages";
import { getActivePageSections } from "@/lib/queries/page-sections";

export const revalidate = PUBLIC_REVALIDATE_SECONDS;

/**
 * 홈. pages.slug = home 의 page_sections 를 렌더한다.
 */
export default async function Home() {
  const page = await getHomePage();
  if (!page) notFound();

  const sections = await getActivePageSections(page.id);
  return <PageSections sections={sections} />;
}
