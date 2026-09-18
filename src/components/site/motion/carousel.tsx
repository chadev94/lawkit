"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * 손으로 끌어 넘기는 가로 목록. 놓으면 카드 경계에 맞춰 멈춘다(scroll-snap).
 * 폰에서는 손가락 스와이프가 기본으로 되고, 마우스는 여기서 드래그를 붙인다.
 * 화살표 버튼은 키보드·보조기기용 대체 경로.
 */
export function Carousel({
  children,
  ariaLabel,
}: {
  children: ReactNode;
  ariaLabel: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, left: 0 });

  // 손을 떼면 가장 가까운 카드 시작점으로 부드럽게. 스냅을 바로 켜면 그 자리로 점프한다.
  function settle() {
    if (!dragging) return;
    setDragging(false);
    const el = track.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const w = first ? first.offsetWidth + 16 : el.clientWidth * 0.8;
    const target = Math.round(el.scrollLeft / w) * w;
    el.scrollTo({ left: target, behavior: "smooth" });
  }

  function step(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const w = first ? first.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  }

  return (
    <div className="m-carousel">
      <div
        ref={track}
        role="region"
        aria-label={ariaLabel}
        className="m-carousel-track"
        data-dragging={dragging || undefined}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") return;
          const el = track.current!;
          start.current = { x: e.clientX, left: el.scrollLeft };
          setDragging(true);
          el.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          track.current!.scrollLeft =
            start.current.left - (e.clientX - start.current.x);
        }}
        onPointerUp={settle}
        onPointerCancel={settle}
      >
        {children}
      </div>
      <div className="m-carousel-nav">
        <button type="button" onClick={() => step(-1)} aria-label="이전">
          ←
        </button>
        <button type="button" onClick={() => step(1)} aria-label="다음">
          →
        </button>
      </div>
    </div>
  );
}
