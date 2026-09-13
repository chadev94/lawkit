import type { PageSection } from "@/lib/sections";
import { parseContactContent } from "@/lib/section-content";

/** 푸터 상단 상담 문의 폼. 저장·동의·알림 처리는 YP-9 에서 붙인다. */
export function ContactForm({ section }: { section: PageSection }) {
  const content = parseContactContent(section.content);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-2xl font-semibold text-zinc-900">
          {section.title ?? "상담 문의"}
        </h2>
        {section.subtitle && (
          <p className="mt-2 text-sm text-zinc-500">{section.subtitle}</p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">
              성함 <span className="text-red-500">*</span>
            </span>
            <input
              disabled
              className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">연락처</span>
            <input
              disabled
              className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">
              이메일 <span className="text-red-500">*</span>
            </span>
            <input
              disabled
              className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">상담 분야</span>
            <input
              disabled
              className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-zinc-500">상담 내용</span>
            <textarea
              disabled
              rows={5}
              className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            <input type="checkbox" disabled />
            {content.consent_label}
          </label>

          <button
            disabled
            className="rounded bg-zinc-900 px-5 py-2 text-sm text-white opacity-40"
          >
            {content.submit_label}
          </button>
        </div>
      </div>
    </section>
  );
}
