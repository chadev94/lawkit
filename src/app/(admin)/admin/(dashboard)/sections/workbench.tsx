"use client";

import { useCallback, useMemo, useState } from "react";
import type { Section, PageSection, SitePage } from "@/lib/sections";
import type { SiteSettings } from "@/lib/site-settings";
import type { PreviewNavItem } from "@/app/(admin)/admin/site-preview";
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
  pagePath,
  sections,
  linkablePages,
  sectionKinds,
  settings,
  nav,
  pageTitle,
}: {
  pageId: string;
  /** 공개 사이트에서 이 페이지의 경로. 토스트 링크 */
  pagePath: string;
  sections: PageSection[];
  linkablePages: SitePage[];
  sectionKinds: Section[];
  settings: SiteSettings;
  nav: PreviewNavItem[];
  pageTitle: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PageSection | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);

  // 저장된 행을 잠깐 빛내고 끈다.
  const onSaved = useCallback((id: string) => {
    setFlashId(id);
    window.setTimeout(
      () => setFlashId((cur) => (cur === id ? null : cur)),
      1800,
    );
  }, []);

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
    <div className="a-workbench">
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
            {sections.map((section, index) => (
              <SectionItem
                key={section.id}
                section={section}
                pages={linkablePages}
                editing={editingId === section.id}
                position={index}
                count={sections.length}
                pagePath={pagePath}
                flash={flashId === section.id}
                onEditToggle={() => onEditToggle(section.id)}
                onDraft={setDraft}
                onFieldFocus={setActiveField}
                onSaved={onSaved}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="a-workbench-preview min-w-0">
        <PreviewPane
          sections={previewSections}
          settings={settings}
          nav={nav}
          pageTitle={pageTitle}
          highlightId={editingId}
          activeField={activeField}
          dirty={draft !== null}
        />
      </div>
    </div>
  );
}
