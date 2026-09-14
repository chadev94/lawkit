"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  DEFAULT_CONTENT,
  googleFontsHref,
  siteSettingsToCssVars,
  type SiteColors,
  type SiteTypography,
} from "@/lib/site-settings";

/**
 * 저장 전 테마 미리보기 다이얼로그.
 * 실제 공개 사이트를 iframe 으로 띄우고, 같은 오리진임을 이용해
 * 폼의 현재 색상·폰트를 iframe 안 CSS 변수에 직접 덮어쓴다.
 * 문구·이미지 등 콘텐츠는 저장된 값 그대로 보인다.
 */

export type ThemePreviewData = {
  colors: SiteColors;
  typography: SiteTypography;
};

export function ThemePreviewDialog({
  data,
  onClose,
}: {
  data: ThemePreviewData;
  onClose: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // iframe 로드(내부 링크 이동 포함)마다 draft 테마를 다시 주입한다.
  // React 가 렌더한 요소의 style 속성을 직접 바꾸면 하이드레이션 불일치가 나므로,
  // head 에 별도 <style> 을 추가해 !important 로 CSS 변수만 덮어쓴다.
  const applyTheme = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.head) return;

    const vars = siteSettingsToCssVars({
      id: "preview",
      key: "preview",
      colors: data.colors,
      typography: data.typography,
      content: DEFAULT_CONTENT,
    });
    const decls = Object.entries(vars)
      .map(([name, value]) => `${name}: ${value} !important;`)
      .join(" ");

    const styleId = "theme-preview-overrides";
    let styleEl = doc.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = styleId;
      doc.head.appendChild(styleEl);
    }
    styleEl.textContent = `.site-theme { ${decls} }`;

    const fontsHref = googleFontsHref(data.typography);
    if (fontsHref && !doc.querySelector(`link[href="${fontsHref}"]`)) {
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = fontsHref;
      doc.head.appendChild(link);
    }
  }, [data]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="테마 미리보기"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">미리보기</p>
            <p className="text-xs text-zinc-500">
              현재 색상·폰트를 적용한 실제 사이트입니다. 설정 저장을 눌러야
              반영됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
          >
            닫기
          </button>
        </div>

        <iframe
          ref={iframeRef}
          src="/"
          onLoad={applyTheme}
          title="테마 미리보기"
          className="w-full flex-1 border-0 bg-white"
        />
      </div>
    </div>
  );
}
