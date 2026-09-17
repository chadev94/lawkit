"use client";

import { PageSections } from "@/components/site/page-sections";
import type { PageSection } from "@/lib/sections";
import type { SiteSettings } from "@/lib/site-settings";
import {
  SitePreviewFrame,
  type PreviewNavItem,
} from "@/app/(admin)/admin/site-preview";

/**
 * 화면 구성의 미리보기. 공용 틀(머리말·꼬리말)에 이 페이지의 블록을 넣는다.
 * 저장하지 않은 편집 중 값이 그대로 들어오므로 입력과 동시에 바뀐다.
 */
export function PreviewPane({
  sections,
  settings,
  nav,
  pageTitle,
  highlightId,
  activeField,
  dirty,
}: {
  sections: PageSection[];
  settings: SiteSettings;
  nav: PreviewNavItem[];
  pageTitle: string;
  highlightId: string | null;
  activeField: string | null;
  dirty: boolean;
}) {
  const visible = sections.filter((section) => section.is_active);
  const hiddenEditing =
    highlightId !== null &&
    sections.some((s) => s.id === highlightId && !s.is_active);
  const blockSelector = highlightId
    ? `[data-preview-section="${highlightId}"]`
    : null;

  return (
    <SitePreviewFrame
      settings={settings}
      nav={nav}
      label={pageTitle}
      dirty={dirty}
      activeField={activeField}
      scopeSelector={blockSelector}
      scrollToSelector={blockSelector}
      notice={
        hiddenEditing ? (
          <p
            className="px-3 py-1.5 text-[11px]"
            style={{
              background: "var(--a-warn-soft)",
              color: "var(--a-warn)",
              borderBottom: "1px solid var(--a-line-soft)",
            }}
          >
            이 블록은 숨김 상태라 실제 사이트에는 나오지 않습니다.
          </p>
        ) : null
      }
    >
      {visible.length === 0 ? (
        <p className="a-hint px-6 py-24 text-center">
          노출 중인 블록이 없습니다.
        </p>
      ) : (
        <PageSections sections={visible} highlightId={highlightId} />
      )}
    </SitePreviewFrame>
  );
}
