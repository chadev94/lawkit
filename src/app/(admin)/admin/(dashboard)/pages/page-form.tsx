"use client";

import { useActionState } from "react";
import { createPage, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export function PageForm() {
  const [state, formAction, pending] = useActionState(createPage, initialState);

  return (
    <form
      action={formAction}
      className="a-panel flex flex-col gap-3 p-4"
    >
      {/* 순서는 목록의 ▲▼ 로 바꾼다. 새 페이지는 맨 뒤에 붙는다. */}
      <input type="hidden" name="sort_order" value={99} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="a-label">페이지 이름</span>
          <input
            name="title"
            required
            placeholder="예: 업무분야"
            className="a-input"
            aria-invalid={state.field === "title" || undefined}
          />
          {state.error && state.field === "title" && (
            <span className="a-field-error">⚠ {state.error}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="a-label">
            주소 (영문){" "}
            <span style={{ color: "var(--a-ink-3)" }}>사이트주소/ 뒤에 붙는 말</span>
          </span>
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            placeholder="예: practice-areas"
            className="a-input"
            aria-invalid={state.field === "slug" || undefined}
          />
          {state.error && state.field === "slug" && (
            <span className="a-field-error">⚠ {state.error}</span>
          )}
        </label>
      </div>

      <label className="a-check">
        <input type="checkbox" name="show_in_nav" defaultChecked />
        메뉴에 표시 — 사이트 상단 메뉴에 이 페이지가 나옵니다
      </label>

      {state.error && !state.field && <p className="a-error">⚠ {state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="a-btn a-btn-primary self-start"
      >
        {pending ? "등록 중..." : "페이지 추가"}
      </button>
    </form>
  );
}
