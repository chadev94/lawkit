import { Hero } from "@/components/site/hero";
import { PageLinkSection } from "@/components/site/page-link-section";
import { ConsultationCta } from "@/components/site/consultation-cta";
import { ContactForm } from "@/components/site/contact-form";
import type { PageSection } from "@/lib/sections";

/**
 * page_sections 를 kind 별로 렌더한다.
 * 컴포넌트 매핑은 코드에 남고, 배치·카피는 DB가 담당한다.
 *
 * highlightId 는 어드민 미리보기 전용이다. 공개 사이트에서는 넘기지 않는다.
 */
export function PageSections({
  sections,
  highlightId = null,
}: {
  sections: PageSection[];
  highlightId?: string | null;
}) {
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
        const body = renderSection(section);
        if (body === null) return null;

        return (
          <div
            key={section.id}
            data-preview-section={section.id}
            data-block-active={section.id === highlightId || undefined}
            className="relative"
          >
            {body}
          </div>
        );
      })}
    </main>
  );
}

function renderSection(section: PageSection) {
  switch (section.kind) {
    case "hero":
      return <Hero section={section} />;
    case "page_link":
      return <PageLinkSection section={section} />;
    case "cta":
      return <ConsultationCta section={section} />;
    case "contact":
      return <ContactForm section={section} />;
    default:
      return null;
  }
}
