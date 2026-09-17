"use client";

import { useEffect } from "react";

/**
 * 저장하지 않은 변경이 있는지. 화면 어디서든 켜고 끌 수 있고,
 * 상단 탭과 브라우저 닫기/새로고침이 이 값을 보고 한 번 묻는다.
 */
const dirtyKeys = new Set<string>();

export function isDirty(): boolean {
  return dirtyKeys.size > 0;
}

export const UNSAVED_MESSAGE =
  "저장하지 않은 변경이 있습니다. 이 화면을 떠나면 사라집니다. 떠날까요?";

/** 편집 중인 컴포넌트가 dirty 상태를 등록한다. 언마운트되면 자동으로 지운다. */
export function useUnsavedGuard(key: string, dirty: boolean) {
  useEffect(() => {
    if (dirty) dirtyKeys.add(key);
    else dirtyKeys.delete(key);
    return () => {
      dirtyKeys.delete(key);
    };
  }, [key, dirty]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // 최신 브라우저는 문구를 무시하고 기본 문구를 쓴다. returnValue 는 호환용.
      e.returnValue = UNSAVED_MESSAGE;
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}
