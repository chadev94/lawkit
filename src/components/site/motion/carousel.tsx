"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * 손으로 끌어 넘기는 가로 목록. 놓으면 카드 경계에 맞춰 멈춘다(scroll-snap).
 * 폰에서는 손가락 스와이프가 기본으로 되고, 마우스는 여기서 드래그를 붙인다.
 * 화살표 버튼은 키보드·보조기기용 대체 경로.
 *
 * 라이트박스·링크 등 카드 안 클릭 가능 요소에서는 드래그를 시작하지 않는다.
 * setPointerCapture 가 클릭을 가로채 lightbox 이 안 열리는 것을 막기 위함.
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
          // 버튼·링크 클릭은 드래그로 가로채지 않는다
          if (
            e.target instanceof Element &&
            e.target.closest(
              "a, button, input, textarea, select, label, [role='button']",
            )
          ) {
            return;
          }
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
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
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
