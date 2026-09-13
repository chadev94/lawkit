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
    <section className="bg-zinc-50 py-20">
      <div className="mx-auto max-w-xl px-6 text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-400">
          {content.badge || "YOUR SITUATION"}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-900">
          {section.title ?? "내 상황, 1분이면 확인됩니다"}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          {section.subtitle ??
            "간단한 질문 4개에 답하면 맞춤 안내를 받으실 수 있습니다."}
        </p>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">4단계 중 1번째</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-zinc-100">
            <div className="h-1 w-1/4 rounded-full bg-zinc-900" />
          </div>

          <p className="mt-6 text-sm font-medium text-zinc-900">질문 영역</p>

          <div className="mt-4 space-y-2">
            {options.length === 0
              ? [0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-300"
                  >
                    선택지
                    <span className="h-4 w-4 rounded-full border border-zinc-200" />
                  </div>
                ))
              : options.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-left text-sm text-zinc-700 hover:border-zinc-400"
                  >
                    {item.title ?? "선택지"}
                    <span className="h-4 w-4 rounded-full border border-zinc-300" />
                  </button>
                ))}
          </div>

          {content.button_label && (
            <button
              type="button"
              className="mt-6 w-full rounded bg-zinc-900 px-4 py-2 text-sm text-white"
            >
              {content.button_label}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
