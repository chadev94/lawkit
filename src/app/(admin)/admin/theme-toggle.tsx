"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { ADMIN_THEME_KEY, type AdminThemeMode as Mode } from "./admin-theme";

const MODES: { value: Mode; label: string }[] = [
  { value: "light", label: "밝게" },
  { value: "dark", label: "어둡게" },
  { value: "system", label: "시스템" },
];

function apply(mode: Mode) {
  const shell = document.querySelector<HTMLElement>(".admin-shell");
  if (!shell) return;
  if (mode === "system") delete shell.dataset.theme;
  else shell.dataset.theme = mode;
}

function subscribe(onChange: () => void) {
  // 다른 탭에서 바꾼 경우를 따라간다.
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readStored(): Mode {
  try {
    const saved = localStorage.getItem(ADMIN_THEME_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // 사생활 보호 모드 등에서 접근이 막히면 시스템 설정을 따른다.
  }
  return "system";
}

/**
 * 어드민 화면의 밝기. 공개 사이트는 라이트 고정이라 영향을 받지 않는다.
 * 선택은 이 브라우저에만 저장된다(localStorage).
 */
export function AdminThemeToggle() {
  // 저장된 값은 브라우저에만 있다. 서버 렌더에서는 "시스템"으로 그린 뒤 맞춘다.
  const saved = useSyncExternalStore(subscribe, readStored, () => "system" as Mode);
  const [picked, setPicked] = useState<Mode | null>(null);
  const mode = picked ?? saved;

  const choose = useCallback((next: Mode) => {
    setPicked(next);
    apply(next);
    try {
      localStorage.setItem(ADMIN_THEME_KEY, next);
    } catch {
      // 저장에 실패해도 이번 세션에는 적용된다.
    }
  }, []);

  return (
    <div className="a-seg" role="group" aria-label="화면 밝기">
      {MODES.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => choose(item.value)}
          aria-pressed={mode === item.value}
          data-active={mode === item.value || undefined}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
