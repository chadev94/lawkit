"use client";

import { useActionState, useEffect, useState } from "react";
import type { Menu } from "@/lib/queries/menus";
import {
  deleteMenu,
  toggleMenu,
  updateMenu,
  type ActionState,
} from "./actions";

const initialState: ActionState = { error: null };

export function MenuItem({ menu }: { menu: Menu }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateMenu, initialState);

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="w-8 text-xs text-zinc-400">{menu.sort_order}</span>

        <div className="flex-1">
          <p className="text-sm font-medium">{menu.name}</p>
          <p className="text-xs text-zinc-400">/{menu.slug}</p>
        </div>

        <form
          action={async () => {
            await toggleMenu(menu.id, !menu.is_active);
          }}
        >
          <button
            type="submit"
            className={`rounded px-2 py-1 text-xs ${
              menu.is_active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-400"
            }`}
          >
            {menu.is_active ? "사용중" : "숨김"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="text-xs text-zinc-500 hover:text-zinc-900"
        >
          {editing ? "닫기" : "수정"}
        </button>

        <form
          action={async () => {
            await deleteMenu(menu.id);
          }}
        >
          <button
            type="submit"
            className="text-xs text-zinc-400 hover:text-red-600"
          >
            삭제
          </button>
        </form>
      </div>

      {editing && (
        <MenuEditForm
          key={menu.id}
          menu={menu}
          state={state}
          formAction={formAction}
          pending={pending}
          onClose={() => setEditing(false)}
        />
      )}
    </li>
  );
}

function MenuEditForm({
  menu,
  state,
  formAction,
  pending,
  onClose,
}: {
  menu: Menu;
  state: ActionState;
  formAction: (payload: FormData) => void;
  pending: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (pending) {
      setSubmitted(true);
      return;
    }
    if (submitted && state.error === null) {
      onClose();
    }
  }, [pending, submitted, state.error, onClose]);

  return (
    <form
      action={formAction}
      className="mt-4 flex flex-col gap-3 rounded-md border border-zinc-100 bg-zinc-50 p-4"
    >
      <input type="hidden" name="id" value={menu.id} />
      <input type="hidden" name="previous_slug" value={menu.slug} />

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_120px]">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">메뉴명</span>
          <input
            name="name"
            required
            defaultValue={menu.name}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">경로 (URL)</span>
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={menu.slug}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">순서</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={menu.sort_order}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">상태</span>
          <select
            name="is_active"
            defaultValue={menu.is_active ? "true" : "false"}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="true">사용중</option>
            <option value="false">숨김</option>
          </select>
        </label>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900"
        >
          취소
        </button>
      </div>
    </form>
  );
}
