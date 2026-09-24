"use client";

import { useActionState } from "react";
import type { PageSection } from "@/lib/sections";
import { parseContactContent } from "@/lib/section-content";
import {
  CONSULTATION_HONEYPOT,
  CONSULTATION_IDLE,
  CONSULTATION_MAX_LENGTH,
  fieldsFromSection,
  type ConsultationField,
} from "@/lib/consultation";
import { submitConsultation } from "@/lib/actions/consultation";

const inputClass =
  "rounded border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

/**
 * 상담 신청 폼. 칸은 코드에 없고 블록의 항목(page_section_items)이 칸이다.
 * 어드민에서 항목을 추가하면 여기 input 이 하나 늘어난다.
 * 진짜 검사는 서버 액션이 한다. 여기 required·type 은 제출 전에 빨리 알려주는 용도.
 */
export function ContactForm({ section }: { section: PageSection }) {
  const content = parseContactContent(section.content);
  const fields = fieldsFromSection(section);
  const [state, action, pending] = useActionState(
    submitConsultation,
    CONSULTATION_IDLE,
  );

  return (
    <section id="contact" className="py-20 scroll-mt-[var(--site-nav-h)]">
      <div className="mx-auto max-w-3xl px-6">
        <h2 data-field="title" className="text-2xl font-semibold text-foreground">
          {section.title ?? "상담 문의"}
        </h2>
        {section.subtitle && (
          <p data-field="subtitle" className="mt-2 text-sm text-muted-foreground">
            {section.subtitle}
          </p>
        )}

        {state.status === "ok" ? (
          <p
            role="status"
            data-field="content.success_message"
            className="mt-8 rounded border border-border bg-muted px-4 py-6 text-center text-sm text-foreground"
          >
            {content.success_message}
          </p>
        ) : (
          <form action={action} noValidate={false} className="mt-8">
            <input type="hidden" name="section_id" value={section.id} />
            {/* 봇용. 사람은 보지 못하고 채우지 않는다. */}
            <input
              type="text"
              name={CONSULTATION_HONEYPOT}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            {fields.length === 0 ? (
              <p className="rounded border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                입력 칸이 아직 없습니다. 관리자 화면에서 이 블록에 항목을 추가하면 여기에
                나타납니다.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((field, index) => (
                  <FieldInput
                    key={field.key}
                    field={field}
                    index={index}
                    error={state.errors[field.key]}
                  />
                ))}
              </div>
            )}

            {state.status === "error" && state.message && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {state.message}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label
                data-field="content.consent_label"
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <input type="checkbox" name="consent" required />
                {content.consent_label}
                {state.errors.consent && (
                  <span className="text-red-600">{state.errors.consent}</span>
                )}
              </label>

              <button
                type="submit"
                disabled={pending || fields.length === 0}
                data-field="content.submit_label"
                className="rounded bg-primary px-5 py-2 text-sm text-primary-foreground disabled:opacity-40"
              >
                {pending ? "보내는 중…" : content.submit_label}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function FieldInput({
  field,
  index,
  error,
}: {
  field: ConsultationField;
  index: number;
  error?: string;
}) {
  const name = `answers.${field.key}`;
  const id = `consult-${field.key}`;
  const wide = field.type === "textarea";

  return (
    <label
      htmlFor={id}
      data-field={`items.${index}`}
      data-item-no={index + 1}
      className={`flex flex-col gap-1 ${wide ? "sm:col-span-2" : ""}`}
    >
      <span className="text-xs text-muted-foreground">
        <span data-field={`items.${index}.title`}>{field.label}</span>
        {field.required && <span className="text-red-500"> *</span>}
      </span>
      {field.hint && (
        <span data-field={`items.${index}.subtitle`} className="text-xs text-muted-foreground/70">
          {field.hint}
        </span>
      )}

      {field.type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          required={field.required}
          maxLength={CONSULTATION_MAX_LENGTH.textarea}
          className={inputClass}
        />
      ) : field.type === "select" ? (
        <select id={id} name={name} required={field.required} defaultValue="" className={inputClass}>
          <option value="">선택해 주세요</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={field.type === "text" ? "text" : field.type}
          inputMode={field.type === "tel" ? "tel" : undefined}
          required={field.required}
          maxLength={CONSULTATION_MAX_LENGTH[field.type]}
          className={inputClass}
        />
      )}

      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
