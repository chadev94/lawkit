"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageSections } from "@/components/site/page-sections";
import type { PageSection } from "@/lib/sections";

const DEVICE = {
  desktop: { label: "데스크톱", width: 1280 },
  mobile: { label: "모바일", width: 390 },
} as const;

type DeviceKey = keyof typeof DEVICE;

/**
 * 어드민 우측 미리보기.
 *
 * 공개 사이트와 같은 컴포넌트(PageSections)를 같은 테마 변수 위에서 렌더한다.
 * 저장하지 않은 편집 중 값이 그대로 들어오므로 입력과 동시에 바뀐다.
 *
 * 축소는 CSS zoom 으로 한다. transform: scale 은 레이아웃 높이가 그대로 남아
 * 아래에 빈 공간이 생기므로 쓰지 않는다.
 */
export function PreviewPane({
  sections,
  cssVars,
  siteName,
  navTitles,
  highlightId,
  activeField,
  dirty,
}: {
  sections: PageSection[];
  cssVars: Record<string, string>;
  siteName: string;
  navTitles: string[];
  highlightId: string | null;
  activeField: string | null;
  dirty: boolean;
}) {
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [zoom, setZoom] = useState(1);
  const slotRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const width = DEVICE[device].width;

  const measure = useCallback(() => {
    const slot = slotRef.current;
    if (!slot) return;
    setZoom(Math.min(1, slot.clientWidth / width));
  }, [width]);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    return () => observer.disconnect();
  }, [measure]);

  // 편집 중인 블록으로 따라간다.
  useEffect(() => {
    if (!highlightId) return;
    const target = contentRef.current?.querySelector(
      `[data-preview-section="${highlightId}"]`,
    );
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightId, sections]);

  // 지금 입력 중인 칸에 해당하는 요소만 따로 표시한다.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const marked = root.querySelectorAll("[data-field-active]");
    marked.forEach((el) => el.removeAttribute("data-field-active"));
    if (!highlightId || !activeField) return;
    const block = root.querySelector(
      `[data-preview-section="${highlightId}"]`,
    );
    const target = block?.querySelector(`[data-field="${activeField}"]`);
    if (!target) return;
    target.setAttribute("data-field-active", "");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeField, highlightId, sections]);

  const visible = sections.filter((section) => section.is_active);
  const hiddenEditing =
    highlightId !== null &&
    sections.some((s) => s.id === highlightId && !s.is_active);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-3 py-2">
        <p className="flex items-center gap-2 text-xs text-zinc-500">
          미리보기
          {dirty && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
              저장 전
            </span>
          )}
        </p>

        <div className="flex overflow-hidden rounded-md border border-zinc-300">
          {(Object.keys(DEVICE) as DeviceKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setDevice(key)}
              aria-pressed={device === key}
              className={`px-2.5 py-1 text-[11px] ${
                device === key
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {DEVICE[key].label}
            </button>
          ))}
        </div>
      </div>

      {hiddenEditing && (
        <p className="border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800">
          이 블록은 숨김 상태라 실제 사이트에는 나오지 않습니다.
        </p>
      )}

      <div
        ref={slotRef}
        className="max-h-[calc(100vh-11rem)] overflow-y-auto overflow-x-hidden p-3"
      >
        <div
          ref={contentRef}
          className="admin-preview site-theme mx-auto overflow-hidden rounded-md border border-zinc-200 bg-white"
          style={{ ...cssVars, width, zoom }}
        >
          {/* 공개 사이트 헤더는 서버 컴포넌트라 여기서는 같은 모양으로 그린다. */}
          <header className="border-b" style={{ borderColor: "var(--border)" }}>
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <span className="text-sm font-semibold tracking-tight">
                {siteName}
              </span>
              <nav className="flex gap-6 text-sm">
                {navTitles.map((title) => (
                  <span key={title}>{title}</span>
                ))}
              </nav>
            </div>
          </header>

          {visible.length === 0 ? (
            <p className="px-6 py-24 text-center text-sm text-zinc-400">
              노출 중인 블록이 없습니다.
            </p>
          ) : (
            <PageSections sections={visible} highlightId={highlightId} />
          )}
        </div>
      </div>
    </div>
  );
}
