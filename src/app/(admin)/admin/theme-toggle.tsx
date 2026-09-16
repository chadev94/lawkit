"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { ADMIN_THEME_KEY } from "./admin-theme";

type Resolved = "light" | "dark";

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** 저장값 → 없으면 시스템 설정. 지금 실제로 보이는 밝기. */
function readResolved(): Resolved {
  try {
    const saved = localStorage.getItem(ADMIN_THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // 저장소 접근이 막히면 시스템 설정을 따른다.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function apply(next: Resolved) {
  const shell = document.querySelector<HTMLElement>(".admin-shell");
  if (shell) shell.dataset.theme = next;
  try {
    localStorage.setItem(ADMIN_THEME_KEY, next);
  } catch {
    // 저장에 실패해도 이번 세션에는 적용된다.
  }
}

/**
 * 우측 하단에 떠 있는 밝기 전환 버튼. 해 = 지금 밝음, 달 = 지금 어두움.
 * 누르면 반대로 바뀌고 이 브라우저에 저장된다. 공개 사이트는 영향을 받지 않는다.
 */
export function AdminThemeToggle() {
  const resolved = useSyncExternalStore(
    subscribe,
    readResolved,
    () => "light" as Resolved,
  );
  const [picked, setPicked] = useState<Resolved | null>(null);
  const current = picked ?? resolved;
  const next: Resolved = current === "dark" ? "light" : "dark";

  const toggle = useCallback(() => {
    setPicked(next);
    apply(next);
  }, [next]);

  return (
    <button
      type="button"
      onClick={toggle}
      className="a-fab"
      aria-label={next === "dark" ? "어두운 화면으로" : "밝은 화면으로"}
      title={next === "dark" ? "어두운 화면으로" : "밝은 화면으로"}
      aria-pressed={current === "dark"}
    >
      {current === "dark" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
