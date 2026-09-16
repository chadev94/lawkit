import type { PageSection } from "@/lib/sections";
import { parseCtaContent } from "@/lib/section-content";

/**
 * 상담 퍼널 진입 구간.
 * 선택지는 page_section_items, 카피는 content jsonb.
 */
export function ConsultationCta({ section }: { section: PageSection }) {
  const content = parseCtaContent(section.content);
  const options = section.items;

  return (
    <section className="bg-muted py-20">
      <div className="mx-auto max-w-xl px-6 text-center">
        <p
          data-field="content.badge"
          className="text-xs font-medium tracking-[0.2em] text-accent"
        >
          {content.badge || "YOUR SITUATION"}
        </p>
        <h2 data-field="title" className="mt-3 text-2xl font-semibold text-foreground">
          {section.title ?? "내 상황, 1분이면 확인됩니다"}
        </h2>
        <p data-field="subtitle" className="mt-2 text-sm text-muted-foreground">
          {section.subtitle ??
            "간단한 질문 4개에 답하면 맞춤 안내를 받으실 수 있습니다."}
        </p>

        <div className="mt-8 rounded-xl border border-border bg-background p-6 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">4단계 중 1번째</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-muted">
            <div className="h-1 w-1/4 rounded-full bg-primary" />
          </div>

          <p className="mt-6 text-sm font-medium text-foreground">질문 영역</p>

          <div className="mt-4 space-y-2">
            {options.length === 0
              ? [0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground/60"
                  >
                    선택지
                    <span className="h-4 w-4 rounded-full border border-border" />
                  </div>
                ))
              : options.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    data-field={`items.${index}.title`}
                    className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-left text-sm text-foreground/80 hover:border-accent"
                  >
                    {item.title ?? "선택지"}
                    <span className="h-4 w-4 rounded-full border border-border" />
                  </button>
                ))}
          </div>

          {content.button_label && (
            <button
              type="button"
              data-field="content.button_label"
              className="mt-6 w-full rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              {content.button_label}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
