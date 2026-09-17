"use client";

import { useCallback, useMemo, useState } from "react";
import { PageSections } from "@/components/site/page-sections";
import type { PageSection, SitePage } from "@/lib/sections";
import type { SiteSettings } from "@/lib/site-settings";
import { HOME_PAGE_SLUG } from "@/lib/sections";
import { SitePreviewFrame } from "@/app/(admin)/admin/site-preview";
import { useUnsavedGuard } from "@/app/(admin)/admin/unsaved";
import { PageForm } from "./page-form";
import { PageItem } from "./page-item";

/**
 * 좌: 페이지 목록·편집 / 우: 미리보기.
 * 페이지 이름·메뉴 표시를 고치면 미리보기의 상단 메뉴가 저장 전에 바뀐다.
 * 가운데에는 홈 화면을 넣어 메뉴가 실제 사이트 위에서 어떻게 보이는지 보여준다.
 */
export function PagesWorkbench({
  pages,
  settings,
  homeSections,
}: {
  pages: SitePage[];
  settings: SiteSettings;
  homeSections: PageSection[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SitePage | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  useUnsavedGuard("pages", draft !== null);

  const onEditToggle = useCallback((id: string) => {
    setEditingId((cur) => (cur === id ? null : id));
    setDraft(null);
    setActiveField(null);
  }, []);

  // 저장된 목록에 편집 중인 값을 덮어 상단 메뉴를 만든다. 공개 사이트와 같은 조건.
  const nav = useMemo(() => {
    const merged = draft
      ? pages.map((p) => (p.id === draft.id ? draft : p))
      : pages;
    return merged
      .filter((p) => p.is_active && p.show_in_nav && p.slug !== HOME_PAGE_SLUG)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => ({
        id: p.id,
        title: p.title || "이름 없음",
        active: p.id === editingId,
      }));
  }, [pages, draft, editingId]);

  const editingHiddenFromNav =
    editingId !== null &&
    !nav.some((n) => n.id === editingId) &&
    pages.find((p) => p.id === editingId)?.slug !== HOME_PAGE_SLUG;

  const visibleHome = homeSections.filter((s) => s.is_active);

  return (
    <div className="a-workbench">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="a-hint">
            페이지 {pages.length}개 · 위에서 아래 순서가 상단 메뉴 순서
          </p>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="a-btn a-btn-default a-btn-sm"
          >
            {adding ? "추가 닫기" : "페이지 추가"}
          </button>
        </div>

        {adding && <PageForm />}

        {pages.length === 0 ? (
          <p className="a-empty">
            등록된 페이지가 없습니다. 위에서 첫 페이지를 추가하세요.
          </p>
        ) : (
          <ul className="a-list">
            {pages.map((page, index) => (
              <PageItem
                key={page.id}
                page={page}
                position={index}
                count={pages.length}
                editing={editingId === page.id}
                onEditToggle={() => onEditToggle(page.id)}
                onDraft={setDraft}
                onFieldFocus={setActiveField}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="a-workbench-preview min-w-0">
        <SitePreviewFrame
          settings={settings}
          nav={nav}
          label="상단 메뉴 · 홈"
          dirty={draft !== null}
          activeField={activeField}
          onPick={({ field }) => {
            const id = field?.startsWith("nav.") ? field.slice(4) : null;
            if (!id) return;
            setDraft(null);
            setActiveField(null);
            setEditingId(id);
          }}
          scrollToSelector={editingId ? '[data-field="header"]' : null}
          notice={
            editingHiddenFromNav ? (
              <p
                className="px-3 py-1.5 text-[11px]"
                style={{
                  background: "var(--a-warn-soft)",
                  color: "var(--a-warn)",
                  borderBottom: "1px solid var(--a-line-soft)",
                }}
              >
                이 페이지는 메뉴에 표시하지 않거나 숨김 상태라 상단 메뉴에
                나오지 않습니다. 주소로는 열립니다.
              </p>
            ) : null
          }
        >
          {visibleHome.length === 0 ? (
            <p className="a-hint px-6 py-24 text-center">
              홈에 노출 중인 블록이 없습니다.
            </p>
          ) : (
            <PageSections sections={visibleHome} />
          )}
        </SitePreviewFrame>
      </div>
    </div>
  );
}
