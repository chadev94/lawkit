"use client";

import { useTransition } from "react";

/**
 * 목록 행의 ▲▼. 숫자를 외워 입력하는 대신 한 칸씩 옮긴다. 누르면 바로 저장된다.
 */
export function OrderButtons({
  canUp,
  canDown,
  onMove,
  label,
}: {
  canUp: boolean;
  canDown: boolean;
  onMove: (direction: "up" | "down") => Promise<unknown> | void;
  /** 접근성 이름에 붙일 대상. "업무분야 블록" */
  label: string;
}) {
  const [pending, start] = useTransition();
  const move = (direction: "up" | "down") =>
    start(async () => {
      await onMove(direction);
    });

  return (
    <span className="a-ord">
      <button
        type="button"
        onClick={() => move("up")}
        disabled={!canUp || pending}
        aria-label={`${label} 위로`}
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => move("down")}
        disabled={!canDown || pending}
        aria-label={`${label} 아래로`}
      >
        ▼
      </button>
    </span>
  );
}
