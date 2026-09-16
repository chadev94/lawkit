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
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px]">
        <label className="flex flex-col gap-1">
          <span className="a-label">페이지 이름</span>
          <input
            name="title"
            required
            placeholder="업무분야"
            className="a-input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="a-label">경로 (URL)</span>
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            placeholder="practice-areas"
            className="a-input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="a-label">순서</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            className="a-input"
          />
        </label>
      </div>

      <label className="a-check">
        <input type="checkbox" name="show_in_nav" defaultChecked />
        메뉴 노출 — 공개 사이트 상단 네비게이션에 표시
      </label>

      {state.error && <p className="a-error">{state.error}</p>}

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
