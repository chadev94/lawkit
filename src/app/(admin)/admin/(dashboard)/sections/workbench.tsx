"use client";

import { useCallback, useMemo, useState } from "react";
import type { Section, PageSection, SitePage } from "@/lib/sections";
import { PreviewPane } from "./preview-pane";
import { SectionForm } from "./section-form";
import { SectionItem } from "./section-item";

/**
 * 좌: 블록 목록·편집 / 우: 미리보기.
 *
 * 편집 중인 값(draft)을 이 컴포넌트가 들고 있다가 미리보기에 넘긴다.
 * 그래서 저장하지 않아도 입력한 결과를 그대로 볼 수 있다.
 */
export function SectionsWorkbench({
  pageId,
  sections,
  linkablePages,
  sectionKinds,
  cssVars,
  siteName,
  navTitles,
}: {
  pageId: string;
  sections: PageSection[];
  linkablePages: SitePage[];
  sectionKinds: Section[];
  cssVars: Record<string, string>;
  siteName: string;
  navTitles: string[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PageSection | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const onEditToggle = useCallback((id: string) => {
    setEditingId((current) => (current === id ? null : id));
    setDraft(null);
    setActiveField(null);
  }, []);

  // 저장된 목록에 편집 중인 값을 덮어 미리보기용 배열을 만든다.
  const previewSections = useMemo(() => {
    const merged = draft
      ? sections.map((section) => (section.id === draft.id ? draft : section))
      : sections;
    return [...merged].sort((a, b) => a.sort_order - b.sort_order);
  }, [sections, draft]);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="a-label">블록 {sections.length}개</p>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="a-btn a-btn-default a-btn-sm"
          >
            {adding ? "추가 닫기" : "블록 추가"}
          </button>
        </div>

        {adding && (
          <SectionForm
            pageId={pageId}
            pages={linkablePages}
            sectionKinds={sectionKinds}
          />
        )}

        {sections.length === 0 ? (
          <p className="a-empty">
            이 페이지에 등록된 블록이 없습니다. 위의 블록 추가로 시작하세요.
          </p>
        ) : (
          <ul className="a-list">
            {sections.map((section) => (
              <SectionItem
                key={section.id}
                section={section}
                pages={linkablePages}
                editing={editingId === section.id}
                onEditToggle={() => onEditToggle(section.id)}
                onDraft={setDraft}
                onFieldFocus={setActiveField}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="min-w-0 xl:sticky xl:top-6">
        <PreviewPane
          sections={previewSections}
          cssVars={cssVars}
          siteName={siteName}
          navTitles={navTitles}
          highlightId={editingId}
          activeField={activeField}
          dirty={draft !== null}
        />
      </div>
    </div>
  );
}
