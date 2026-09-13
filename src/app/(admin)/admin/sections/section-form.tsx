"use client";

import { useActionState, useState } from "react";
import type { Menu } from "@/lib/queries/menus";
import {
  SECTION_KIND_LABEL,
  SECTION_LAYOUT_LABEL,
  type SectionKind,
} from "@/lib/sections";
import { createSection, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export function SectionForm({ menus }: { menus: Menu[] }) {
  const [kind, setKind] = useState<SectionKind>("menu");
  const [state, formAction, pending] = useActionState(
    createSection,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">섹션 종류</span>
          <select
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as SectionKind)}
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          >
            {Object.entries(SECTION_KIND_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {kind === "menu" && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">연결할 메뉴</span>
            <select
              name="menu_id"
              required
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">선택하세요</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {kind === "menu" && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">표시 방식</span>
            <select
              name="layout"
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            >
              {Object.entries(SECTION_LAYOUT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px]">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">
            제목 <span className="text-zinc-300">(비우면 메뉴명 사용)</span>
          </span>
          <input
            name="title"
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">부제</span>
          <input
            name="subtitle"
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
        {pending ? "추가 중..." : "섹션 추가"}
      </button>
    </form>
  );
}
