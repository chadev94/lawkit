import { Hero } from "@/components/site/hero";
import { MenuSection } from "@/components/site/menu-section";
import { ConsultationCta } from "@/components/site/consultation-cta";
import { ContactForm } from "@/components/site/contact-form";
import type { PageSection } from "@/lib/sections";

/**
 * page_sections 를 kind 별로 렌더한다.
 * 컴포넌트 매핑은 코드에 남고, 배치·카피는 DB가 담당한다.
 */
export function PageSections({ sections }: { sections: PageSection[] }) {
  if (sections.length === 0) {
    return (
      <main className="py-32 text-center">
        <p className="text-sm text-muted-foreground">등록된 섹션이 없습니다.</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          admin에서 이 페이지에 섹션을 추가하면 여기에 표시됩니다.
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
