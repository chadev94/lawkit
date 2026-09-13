"use client";

import { useActionState } from "react";
import { createMenu, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export function MenuForm() {
  const [state, formAction, pending] = useActionState(createMenu, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px]">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">메뉴명</span>
          <input
            name="name"
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

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "등록 중..." : "메뉴 추가"}
      </button>
    </form>
  );
}
