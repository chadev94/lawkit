"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PageSections } from "@/components/site/page-sections";
import type { PageSection, SitePage } from "@/lib/sections";
import type { SiteSettings } from "@/lib/site-settings";
import { HOME_PAGE_SLUG } from "@/lib/sections";
import { SitePreviewFrame } from "@/app/(admin)/admin/site-preview";
import { toast } from "@/app/(admin)/admin/toast";
import { useUnsavedGuard } from "@/app/(admin)/admin/unsaved";
import { reorderPages } from "./actions";
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
  const [, startReorder] = useTransition();
  useUnsavedGuard("pages", draft !== null);

  // 드래그로 바꾼 순서. 서버 저장 전에도 목록·미리보기 메뉴에 바로 반영된다.
  const [orderIds, setOrderIds] = useState<string[]>(() =>
    pages.map((p) => p.id),
  );

  // 저장·추가·삭제로 서버 목록이 갱신되면 로컬 순서를 다시 맞춘다.
  const [prevPages, setPrevPages] = useState(pages);
  if (pages !== prevPages) {
    setPrevPages(pages);
    setOrderIds(pages.map((p) => p.id));
  }

  const orderedPages = useMemo(() => {
    const byId = new Map(pages.map((p) => [p.id, p]));
    return orderIds
      .map((id) => byId.get(id))
      .filter((p): p is SitePage => p !== undefined);
  }, [pages, orderIds]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const previous = orderIds;
      const from = previous.indexOf(String(active.id));
      const to = previous.indexOf(String(over.id));
      if (from === -1 || to === -1) return;
      const next = arrayMove(previous, from, to);
      setOrderIds(next);
      startReorder(async () => {
        const result = await reorderPages(next);
        if (!result.ok) {
          setOrderIds(previous);
          toast({ message: result.error, kind: "error" });
          return;
        }
        toast({ message: "메뉴 순서가 바뀌었습니다 · 사이트에 반영" });
      });
    },
    [orderIds],
  );

  const onEditToggle = useCallback((id: string) => {
    setEditingId((cur) => (cur === id ? null : id));
    setDraft(null);
    setActiveField(null);
  }, []);

  // 저장된 목록에 편집 중인 값을 덮어 상단 메뉴를 만든다. 공개 사이트와 같은 조건.
  // 순서는 드래그 직후의 로컬 순서(orderedPages)를 그대로 따른다.
  const nav = useMemo(() => {
    const merged = draft
      ? orderedPages.map((p) => (p.id === draft.id ? draft : p))
      : orderedPages;
    return merged
      .filter((p) => p.is_active && p.show_in_nav && p.slug !== HOME_PAGE_SLUG)
      .map((p) => ({
        id: p.id,
        title: p.title || "이름 없음",
        active: p.id === editingId,
      }));
  }, [orderedPages, draft, editingId]);

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={orderIds}
              strategy={verticalListSortingStrategy}
            >
              <ul className="a-list">
                {orderedPages.map((page, index) => (
                  <PageItem
                    key={page.id}
                    page={page}
                    position={index}
                    editing={editingId === page.id}
                    onEditToggle={() => onEditToggle(page.id)}
                    onDraft={setDraft}
                    onFieldFocus={setActiveField}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
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
