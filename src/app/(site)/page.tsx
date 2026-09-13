import { getActiveSections } from "@/lib/queries/home-sections";
import { Hero } from "@/components/site/hero";
import { MenuSection } from "@/components/site/menu-section";
import { ConsultationCta } from "@/components/site/consultation-cta";
import { ContactForm } from "@/components/site/contact-form";

/**
 * 메인 페이지는 home_sections 에 등록된 것만 순서대로 렌더한다.
 * 코드에 고정된 섹션은 없다. 구성은 전적으로 admin이 정한다.
 */
export default async function Home() {
  const sections = await getActiveSections();

  if (sections.length === 0) {
    return (
      <main className="py-32 text-center">
        <p className="text-sm text-zinc-400">등록된 섹션이 없습니다.</p>
        <p className="mt-1 text-xs text-zinc-300">
          admin에서 섹션을 추가하면 여기에 표시됩니다.
        </p>
      </main>
    );
  }

  return (
    <main>
      {sections.map((section) => {
        switch (section.kind) {
          case "hero":
            return <Hero key={section.id} section={section} />;
          case "menu":
            return <MenuSection key={section.id} section={section} />;
          case "cta":
            return <ConsultationCta key={section.id} section={section} />;
          case "contact":
            return <ContactForm key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
