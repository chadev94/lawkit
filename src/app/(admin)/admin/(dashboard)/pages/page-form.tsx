"use client";

import { useActionState } from "react";
import { createPage, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export function PageForm() {
  const [state, formAction, pending] = useActionState(createPage, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px]">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">페이지 이름</span>
          <input
            name="title"
            required
            placeholder="업무분야"
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">경로 (URL)</span>
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            placeholder="practice-areas"
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">순서</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-xs text-zinc-600">
        <input type="checkbox" name="show_in_nav" defaultChecked />
        메뉴 노출 — 공개 사이트 상단 네비게이션에 표시
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "등록 중..." : "페이지 추가"}
      </button>
    </form>
  );
}
