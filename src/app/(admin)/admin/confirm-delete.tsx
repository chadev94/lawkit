"use client";

import { useEffect, useRef, useState, useTransition } from "react";

const ARM_SECONDS = 3;

/**
 * 두 단계 삭제. 한 번 누르면 "정말 삭제 (3)" 로 바뀌고 3초 안에 다시 눌러야 실행된다.
 * 놓치면 원래대로 돌아간다. 되돌릴 수 없는 동작은 전부 이걸 쓴다.
 */
export function ConfirmDeleteButton({
  onConfirm,
  note,
  label = "삭제",
  className = "a-btn a-btn-danger a-btn-sm",
}: {
  onConfirm: () => Promise<unknown> | void;
  /** 함께 사라지는 것이 있으면 말해 준다. "항목 3개도 함께 삭제됩니다" */
  note?: string;
  label?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const [left, setLeft] = useState(ARM_SECONDS);
  const [pending, start] = useTransition();
  const timer = useRef<number | null>(null);

  // 켜진 동안 남은 초를 세고, 0이 되면 스스로 꺼진다.
  useEffect(() => {
    if (!armed) return;
    const startedAt = Date.now();
    timer.current = window.setInterval(() => {
      const remain = ARM_SECONDS - Math.floor((Date.now() - startedAt) / 1000);
      if (remain <= 0) setArmed(false);
      else setLeft(remain);
    }, 250);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [armed]);

  function onClick() {
    if (!armed) {
      setLeft(ARM_SECONDS);
      setArmed(true);
      return;
    }
    setArmed(false);
    start(async () => {
      await onConfirm();
    });
  }

  return (
    <span className="a-confirm">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={className}
        data-arm={armed || undefined}
        aria-live="polite"
      >
        {pending ? "삭제 중…" : armed ? `정말 삭제 (${left})` : label}
      </button>
      {armed && note && <span className="a-confirm-note">{note}</span>}
    </span>
  );
}
