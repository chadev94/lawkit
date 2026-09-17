"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ConfirmDeleteButton } from "@/app/(admin)/admin/confirm-delete";
import { OrderButtons } from "@/app/(admin)/admin/order-buttons";
import { toast } from "@/app/(admin)/admin/toast";
import { HOME_PAGE_SLUG, pagePath, type SitePage } from "@/lib/sections";
import {
  countPageSections,
  deletePage,
  movePage,
  togglePage,
  updatePage,
  type ActionState,
} from "./actions";

const initialState: ActionState = { error: null };

export function PageItem({
  page,
  position,
  count,
  editing,
  onEditToggle,
  onDraft,
  onFieldFocus,
}: {
  page: SitePage;
  position: number;
  count: number;
  editing: boolean;
  onEditToggle: () => void;
  /** 편집 중 값. 미리보기의 상단 메뉴가 저장 전에 바뀐다 */
  onDraft: (draft: SitePage | null) => void;
  onFieldFocus: (field: string | null) => void;
}) {
  const [flash, setFlash] = useState(false);
  const [state, formAction, pending] = useActionState(updatePage, initialState);
  const isHome = page.slug === HOME_PAGE_SLUG;
  const path = pagePath(page.slug);

  return (
    <li className={editing ? "a-row-open" : undefined}>
      <div className="a-row" data-flash={flash || undefined}>
        <span className="a-row-ord">
          <OrderButtons
            canUp={position > 0}
            canDown={position < count - 1}
            label={`${page.title} 페이지`}
            onMove={async (direction) => {
              await movePage(page.id, direction);
              toast({ message: "메뉴 순서가 바뀌었습니다 · 사이트에 반영" });
            }}
          />
          <span>{position + 1}</span>
        </span>

        <button type="button" onClick={onEditToggle} className="a-row-main">
          <span className="flex min-w-0 items-center gap-2">
            <span className="a-row-name">{page.title}</span>
            {page.show_in_nav && <span className="a-chip">메뉴에 표시</span>}
          </span>
          <span className="a-row-sub">{pagePath(page.slug)}</span>
        </button>

        <form
          action={async () => {
            await togglePage(page.id, !page.is_active);
            toast({
              message: page.is_active
                ? "페이지를 숨겼습니다 · 주소로도 열리지 않습니다"
                : "페이지를 사용합니다 · 사이트에 나타납니다",
              link: { href: path, label: "사이트에서 보기" },
            });
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
            onClick={onEditToggle}
            className="a-btn a-btn-default a-btn-sm"
          >
            {editing ? "닫기" : "수정"}
          </button>

          {!isHome && <PageDeleteButton page={page} />}
        </div>
      </div>

      {editing && (
        <PageEditForm
          key={page.id}
          page={page}
          state={state}
          formAction={formAction}
          pending={pending}
          onClose={onEditToggle}
          onDraft={onDraft}
          onFieldFocus={onFieldFocus}
          onSaved={() => {
            setFlash(true);
            window.setTimeout(() => setFlash(false), 1800);
            toast({
              message: "저장됨 · 사이트에 반영되었습니다",
              link: { href: path, label: "사이트에서 보기" },
            });
          }}
        />
      )}
    </li>
  );
}

/**
 * 페이지 삭제. 첫 클릭에 딸린 블록 수를 세어 "블록 5개도 함께" 를 붙인다.
 * 블록은 on delete cascade 로 같이 사라지므로 미리 말해야 한다.
 */
function PageDeleteButton({ page }: { page: SitePage }) {
  const [sectionCount, setSectionCount] = useState<number | null>(null);

  return (
    <span
      onPointerEnter={() => {
        if (sectionCount === null) {
          countPageSections(page.id)
            .then(setSectionCount)
            .catch(() => {});
        }
      }}
    >
      <ConfirmDeleteButton
        note={
          sectionCount
            ? `이 페이지의 블록 ${sectionCount}개도 함께 삭제됩니다`
            : "이 페이지의 블록도 함께 삭제됩니다"
        }
        onConfirm={async () => {
          await deletePage(page.id);
          toast({ message: `"${page.title}" 페이지를 삭제했습니다` });
        }}
      />
    </span>
  );
}

function PageEditForm({
  page,
  state,
  formAction,
  pending,
  onClose,
  onDraft,
  onFieldFocus,
  onSaved,
}: {
  page: SitePage;
  state: ActionState;
  formAction: (payload: FormData) => void;
  pending: boolean;
  onClose: () => void;
  onDraft: (draft: SitePage | null) => void;
  onFieldFocus: (field: string | null) => void;
  onSaved: () => void;
}) {
  const wasPendingRef = useRef(false);
  const isHome = page.slug === HOME_PAGE_SLUG;
  const [title, setTitle] = useState(page.title);
  const [showInNav, setShowInNav] = useState(page.show_in_nav);
  const [isActive, setIsActive] = useState(page.is_active);

  // 편집 중인 값을 미리보기로 올린다.
  useEffect(() => {
    onDraft({ ...page, title, show_in_nav: showInNav, is_active: isActive });
  }, [page, title, showInNav, isActive, onDraft]);
  useEffect(() => () => onDraft(null), [onDraft]);

  useEffect(() => {
    if (pending) {
      wasPendingRef.current = true;
      return;
    }
    if (wasPendingRef.current && state.error === null) {
      wasPendingRef.current = false;
      onSaved();
      onClose();
      return;
    }
    wasPendingRef.current = false;
  }, [pending, state.error, onClose, onSaved]);

  return (
    <form action={formAction} className="a-editor">
      <input type="hidden" name="id" value={page.id} />
      <input type="hidden" name="previous_slug" value={page.slug} />

      {/* 순서는 목록의 ▲▼ 로. 값은 그대로 보내 서버가 덮어쓰지 않게 한다. */}
      <input type="hidden" name="sort_order" value={page.sort_order} />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem]">
        <label className="flex flex-col gap-1">
          <span className="a-label">페이지 이름</span>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => onFieldFocus(`nav.${page.id}`)}
            onBlur={() => onFieldFocus(null)}
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
            {isHome && (
              <span style={{ color: "var(--a-ink-3)" }}>홈은 바꿀 수 없음</span>
            )}
          </span>
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={page.slug}
            readOnly={isHome}
            disabled={isHome}
            className="a-input"
            aria-invalid={state.field === "slug" || undefined}
          />
          {isHome && <input type="hidden" name="slug" value={page.slug} />}
          {state.error && state.field === "slug" && (
            <span className="a-field-error">⚠ {state.error}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="a-label">상태</span>
          <select
            name="is_active"
            value={isActive ? "true" : "false"}
            onChange={(e) => setIsActive(e.target.value === "true")}
            className="a-input"
          >
            <option value="true">사용중</option>
            <option value="false">숨김</option>
          </select>
        </label>
      </div>

      <label className="a-check">
        <input
          type="checkbox"
          name="show_in_nav"
          checked={showInNav}
          onChange={(e) => setShowInNav(e.target.checked)}
        />
        메뉴에 표시 — 사이트 상단 메뉴에 이 페이지가 나옵니다
      </label>

      {state.error && !state.field && (
        <p className="a-error">⚠ {state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="a-btn a-btn-primary"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        <button type="button" onClick={onClose} className="a-btn a-btn-quiet">
          취소
        </button>
      </div>
    </form>
  );
}
