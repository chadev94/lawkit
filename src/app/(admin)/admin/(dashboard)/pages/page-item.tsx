"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { HOME_PAGE_SLUG, pagePath, type SitePage } from "@/lib/sections";
import {
  deletePage,
  togglePage,
  updatePage,
  type ActionState,
} from "./actions";

const initialState: ActionState = { error: null };

export function PageItem({ page }: { page: SitePage }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updatePage, initialState);
  const isHome = page.slug === HOME_PAGE_SLUG;

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="w-8 text-xs text-zinc-400">{page.sort_order}</span>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{page.title}</p>
            {page.show_in_nav && (
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">
                메뉴
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">{pagePath(page.slug)}</p>
        </div>

        <form
          action={async () => {
            await togglePage(page.id, !page.is_active);
          }}
        >
          <button
            type="submit"
            className={`rounded px-2 py-1 text-xs ${
              page.is_active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-400"
            }`}
          >
            {page.is_active ? "사용중" : "숨김"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="text-xs text-zinc-500 hover:text-zinc-900"
        >
          {editing ? "닫기" : "수정"}
        </button>

        {!isHome && (
          <form
            action={async () => {
              await deletePage(page.id);
            }}
          >
            <button
              type="submit"
              className="text-xs text-zinc-400 hover:text-red-600"
            >
              삭제
            </button>
          </form>
        )}
      </div>

      {editing && (
        <PageEditForm
          key={page.id}
          page={page}
          state={state}
          formAction={formAction}
          pending={pending}
          onClose={() => setEditing(false)}
        />
      )}
    </li>
  );
}

function PageEditForm({
  page,
  state,
  formAction,
  pending,
  onClose,
}: {
  page: SitePage;
  state: ActionState;
  formAction: (payload: FormData) => void;
  pending: boolean;
  onClose: () => void;
}) {
  const wasPendingRef = useRef(false);
  const isHome = page.slug === HOME_PAGE_SLUG;

  useEffect(() => {
    if (pending) {
      wasPendingRef.current = true;
      return;
    }
    if (wasPendingRef.current && state.error === null) {
      wasPendingRef.current = false;
      onClose();
      return;
    }
    wasPendingRef.current = false;
  }, [pending, state.error, onClose]);

  return (
    <form
      action={formAction}
      className="mt-4 flex flex-col gap-3 rounded-md border border-zinc-100 bg-zinc-50 p-4"
    >
      <input type="hidden" name="id" value={page.id} />
      <input type="hidden" name="previous_slug" value={page.slug} />

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_120px]">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">페이지 이름</span>
          <input
            name="title"
            required
            defaultValue={page.title}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">경로 (URL)</span>
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={page.slug}
            readOnly={isHome}
            title={isHome ? "홈 경로는 바꿀 수 없습니다" : undefined}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm read-only:bg-zinc-100 read-only:text-zinc-400"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">순서</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={page.sort_order}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">상태</span>
          <select
            name="is_active"
            defaultValue={page.is_active ? "true" : "false"}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="true">사용중</option>
            <option value="false">숨김</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-xs text-zinc-600">
        <input type="checkbox" name="show_in_nav" defaultChecked={page.show_in_nav} />
        메뉴 노출 — 공개 사이트 상단 네비게이션에 표시
      </label>

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
