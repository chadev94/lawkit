"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SiteFooter } from "@/components/site/site-footer";
import {
  siteSettingsToCssVars,
  type SiteColors,
  type SiteSettings,
} from "@/lib/site-settings";

/** 색 이름 → CSS 변수. siteSettingsToCssVars 와 같은 규칙(_ → -). */
const colorVar = (key: keyof SiteColors) => `--${key.replace(/_/g, "-")}`;

/** 면(배경)인 색. 표식을 반투명으로 섞어 놀라지 않게 한다. */
const SURFACE_KEYS = new Set<keyof SiteColors>([
  "background",
  "muted",
  "primary",
  "hero_background",
]);

const MARK = "oklch(0.55 0.23 300)";
const MARK_SOFT = "oklch(0.55 0.23 300 / 0.5)";
const PULSE_MS = 600;

const DEVICE = {
  desktop: { label: "데스크톱", width: 1280 },
  mobile: { label: "모바일", width: 390 },
} as const;

type DeviceKey = keyof typeof DEVICE;

export type PreviewNavItem = {
  id: string;
  title: string;
  /** 지금 편집 중인 항목이면 표식을 두른다 */
  active?: boolean;
};

/**
 * 어드민 공용 사이트 미리보기 틀.
 *
 * 공개 사이트와 같은 변수(site_settings → CSS 변수) 위에서 머리말·꼬리말을 같은 모양으로 그리고,
 * 가운데(children)에는 화면마다 다른 것을 넣는다 — 블록 목록, 홈 화면 등.
 * settings 를 편집 중인 값으로 넘기면 사무소 이름·색·글꼴이 저장 전에 바뀐다.
 *
 * 축소는 CSS zoom. transform: scale 은 레이아웃 높이가 남아 아래에 빈 공간이 생긴다.
 * scrollIntoView 는 overflow-x: hidden 인 칸도 가로로 밀어 왼쪽 여백을 없애므로 세로만 직접 계산한다.
 */
export function SitePreviewFrame({
  settings,
  nav,
  children,
  label,
  dirty,
  notice,
  /** 값이 바뀌면 그 요소로 스크롤하고 표식을 둔다. "content.site_name", "nav.<id>", "items.0.title" 등 */
  activeField,
  /** activeField 를 이 요소 안에서만 찾는다(없으면 틀 전체) */
  scopeSelector,
  /** 바뀌면 이 요소가 보이도록 스크롤한다(블록 선택 등) */
  scrollToSelector,
  /** 이 색이 쓰이는 곳을 깜빡여 보여준다. 색 칸에 커서를 둔 동안 */
  pulseColor,
  /** 미리보기 안을 클릭하면 어느 블록·어느 칸인지 알린다. 왼쪽 편집기가 그곳을 연다 */
  onPick,
}: {
  settings: SiteSettings;
  nav: PreviewNavItem[];
  children: ReactNode;
  label: string;
  dirty: boolean;
  notice?: ReactNode;
  activeField?: string | null;
  scopeSelector?: string | null;
  scrollToSelector?: string | null;
  pulseColor?: keyof SiteColors | null;
  onPick?: (pick: { sectionId: string | null; field: string | null }) => void;
}) {
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [pulseOn, setPulseOn] = useState(false);
  // null = 아직 칸 너비를 재지 않았다. 그동안은 그리지 않아 원본 크기로 번쩍이지 않는다.
  const [zoom, setZoom] = useState<number | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const width = DEVICE[device].width;

  const measure = useCallback(() => {
    const slot = slotRef.current;
    if (!slot) return;
    // 안쪽 여백(p-3 = 12px * 2)을 빼고, 반올림으로 칸을 넘치지 않게 1px 여유를 둔다.
    setZoom(Math.min(1, (slot.clientWidth - 24 - 1) / width));
  }, [width]);

  // 첫 측정은 페인트 전에. 그래야 1280px 원본이 한 프레임 보이다 줄어드는 일이 없다.
  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    return () => observer.disconnect();
  }, [measure]);

  const scrollTo = useCallback((el: Element, center: boolean) => {
    const slot = slotRef.current;
    if (!slot) return;
    const slotRect = slot.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const offset = rect.top - slotRect.top + slot.scrollTop;
    const top = center
      ? offset - slot.clientHeight / 2 + rect.height / 2
      : offset - 12;
    slot.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  // 편집 중인 블록으로 따라간다.
  useEffect(() => {
    if (!scrollToSelector) return;
    const target = contentRef.current?.querySelector(scrollToSelector);
    if (target) scrollTo(target, false);
  }, [scrollToSelector, scrollTo]);

  // 지금 입력 중인 칸에 해당하는 요소만 따로 표시한다.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    root
      .querySelectorAll("[data-field-focus]")
      .forEach((el) => el.removeAttribute("data-field-focus"));
    if (!activeField) return;
    const scope = scopeSelector ? root.querySelector(scopeSelector) : root;
    const target = scope?.querySelector(`[data-field="${activeField}"]`);
    if (!target) return;
    target.setAttribute("data-field-focus", "");
    scrollTo(target, true);
  }, [activeField, scopeSelector, scrollTo, children]);

  // 색 깜빡임. 변수 하나의 값을 원래 색 ↔ 표식색으로 번갈아 바꾸면 그 변수를 쓰는 요소가
  // 전부 함께 깜빡인다. 요소를 찾는 방식이 아니라 배경·테두리도 잡힌다.
  // 상태 변경은 전부 타이머 안에서 한다(효과 본문에서 직접 바꾸지 않는다).
  useEffect(() => {
    if (!pulseColor) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // 색이 바뀌면 항상 표식색부터 시작한다.
    const first = window.setTimeout(() => setPulseOn(true), 0);
    if (reduce) return () => window.clearTimeout(first);
    const id = window.setInterval(() => setPulseOn((v) => !v), PULSE_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [pulseColor]);

  const cssVars = siteSettingsToCssVars(settings);
  if (pulseColor && pulseOn) {
    cssVars[colorVar(pulseColor)] = SURFACE_KEYS.has(pulseColor)
      ? MARK_SOFT
      : MARK;
  }

  return (
    <div className="a-card flex flex-col overflow-hidden">
      <div
        className="flex items-center justify-between gap-3 px-3 py-2"
        style={{ borderBottom: "1px solid var(--a-line)" }}
      >
        <p className="a-label flex items-center gap-2">
          미리보기 · {label}
          {dirty && <span className="a-badge a-badge-warn">저장 전</span>}
        </p>

        <div
          className="flex overflow-hidden rounded-[7px]"
          style={{ border: "1px solid var(--a-line)" }}
        >
          {(Object.keys(DEVICE) as DeviceKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setDevice(key)}
              aria-pressed={device === key}
              className="px-2.5 py-1 text-[11px]"
              style={
                device === key
                  ? {
                      background: "var(--a-accent)",
                      color: "var(--a-on-accent)",
                    }
                  : { background: "var(--a-surface)", color: "var(--a-ink-2)" }
              }
            >
              {DEVICE[key].label}
            </button>
          ))}
        </div>
      </div>

      {notice}

      <div
        ref={slotRef}
        className="max-h-[calc(100vh-11rem)] overflow-y-auto overflow-x-hidden p-3"
        style={{ background: "var(--a-surface-3)" }}
      >
        <div
          ref={contentRef}
          // 미리보기 안의 링크는 사이트로 이동시키지 않는다. 클릭은 "이 자리를 고치겠다"로 읽는다.
          onClickCapture={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest("a, button")) e.preventDefault();
            if (!onPick) return;
            const block = target.closest<HTMLElement>("[data-preview-section]");
            const fieldEl = target.closest<HTMLElement>("[data-field]");
            const field = fieldEl?.dataset.field ?? null;
            onPick({
              sectionId: block?.dataset.previewSection ?? null,
              field: field === "header" || field === "footer" ? null : field,
            });
          }}
          className="admin-preview site-theme mx-auto cursor-pointer overflow-hidden rounded-[7px] bg-white"
          style={{
            ...cssVars,
            width,
            zoom: zoom ?? 1,
            visibility: zoom === null ? "hidden" : undefined,
            border: "1px solid var(--a-line)",
          }}
        >
          {/* 공개 사이트 헤더는 서버 컴포넌트라 여기서는 같은 모양으로 그린다. */}
          <header
            className="border-b"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            data-field="header"
          >
            <div className="mx-auto flex h-[var(--site-nav-h,4.75rem)] max-w-6xl items-center justify-between px-6">
              <span
                className="text-sm font-semibold tracking-[0.12em]"
                style={{ fontFamily: "var(--font-site-heading)" }}
                data-field="content.site_name"
              >
                {settings.content.site_name || "사이트 이름"}
              </span>
              <nav className="flex gap-6 text-sm">
                {nav.map((item) => (
                  <span
                    key={item.id}
                    data-field={`nav.${item.id}`}
                    data-field-active={item.active || undefined}
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {item.title}
                  </span>
                ))}
              </nav>
            </div>
          </header>

          {children}

          <div data-field="footer">
            <SiteFooter settings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
}
