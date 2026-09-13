import { notFound } from "next/navigation";
import { PageSections } from "@/components/site/page-sections";
import { getHomePage } from "@/lib/queries/pages";
import { getActivePageSections } from "@/lib/queries/page-sections";

export const dynamic = "force-dynamic";

/**
 * 홈. pages.slug = home 의 page_sections 를 렌더한다.
 */
export default async function Home() {
  const page = await getHomePage();
  if (!page) notFound();

  const sections = await getActivePageSections(page.id);
  return <PageSections sections={sections} />;
}
