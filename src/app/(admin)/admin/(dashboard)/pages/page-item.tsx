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
    <li className={editing ? "a-row-open" : undefined}>
      <div className="a-row">
        <span className="a-row-ord">{page.sort_order}</span>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="a-row-main"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="a-row-name">{page.title}</span>
            {page.show_in_nav && <span className="a-chip">메뉴</span>}
          </span>
          <span className="a-row-sub">{pagePath(page.slug)}</span>
        </button>

        <form
          action={async () => {
            await togglePage(page.id, !page.is_active);
          }}
        >
          <button
            type="submit"
            className={`a-badge ${page.is_active ? "a-badge-ok" : "a-badge-off"}`}
          >
            {page.is_active ? "사용중" : "숨김"}
          </button>
        </form>

        <div className="a-row-acts">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="a-btn a-btn-default a-btn-sm"
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
              className="a-btn a-btn-danger a-btn-sm"
            >
              삭제
            </button>
          </form>
        )}
        </div>
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
      className="a-editor"
    >
      <input type="hidden" name="id" value={page.id} />
      <input type="hidden" name="previous_slug" value={page.slug} />

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_120px]">
        <label className="flex flex-col gap-1">
          <span className="a-label">페이지 이름</span>
          <input
            name="title"
            required
            defaultValue={page.title}
            className="a-input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="a-label">경로 (URL)</span>
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={page.slug}
            readOnly={isHome}
            title={isHome ? "홈 경로는 바꿀 수 없습니다" : undefined}
            className="a-input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="a-label">순서</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={page.sort_order}
            className="a-input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="a-label">상태</span>
          <select
            name="is_active"
            defaultValue={page.is_active ? "true" : "false"}
            className="a-input"
          >
            <option value="true">사용중</option>
            <option value="false">숨김</option>
          </select>
        </label>
      </div>

      <label className="a-check">
        <input type="checkbox" name="show_in_nav" defaultChecked={page.show_in_nav} />
        메뉴 노출 — 공개 사이트 상단 네비게이션에 표시
      </label>

      {state.error && <p className="a-error">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="a-btn a-btn-primary"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="a-btn a-btn-quiet"
        >
          취소
        </button>
      </div>
    </form>
  );
}
