import { Hero } from "@/components/site/hero";
import { PageLinkSection } from "@/components/site/page-link-section";
import { ConsultationCta } from "@/components/site/consultation-cta";
import { ContactForm } from "@/components/site/contact-form";
import { YoutubeGallery } from "@/components/site/youtube-gallery";
import { NewsRoom } from "@/components/site/news-room";
import { ImageGallery } from "@/components/site/image-gallery";
import { ClientReviews } from "@/components/site/client-reviews";
import type { PageSection } from "@/lib/sections";

/**
 * page_sections 를 kind 별로 렌더한다.
 * 컴포넌트 매핑은 코드에 남고, 배치·카피는 DB가 담당한다.
 *
 * highlightId · previewField 는 어드민 미리보기 전용이다. 공개 사이트에서는 넘기지 않는다.
 * previewField 는 지금 입력 중인 칸("content.success_message" 등). 제출해야만 보이는 것을
 * 미리 보여줄 때 쓴다.
 */
export function PageSections({
  sections,
  highlightId = null,
  previewField = null,
}: {
  sections: PageSection[];
  highlightId?: string | null;
  previewField?: string | null;
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
        const body = renderSection(
          section,
          section.id === highlightId ? previewField : null,
        );
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

function renderSection(section: PageSection, previewField: string | null) {
  switch (section.kind) {
    case "hero":
      return <Hero section={section} />;
    case "page_link":
      return <PageLinkSection section={section} />;
    case "cta":
      return <ConsultationCta section={section} />;
    case "contact":
      return (
        <ContactForm
          section={section}
          previewSuccess={previewField?.startsWith("content.success") ?? false}
        />
      );
    case "youtube_gallery":
      return <YoutubeGallery section={section} />;
    case "news_room":
      return <NewsRoom section={section} />;
    case "image_gallery":
      return <ImageGallery section={section} />;
    case "client_reviews":
      return <ClientReviews section={section} />;
    default:
      return null;
  }
}
