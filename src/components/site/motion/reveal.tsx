"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * 화면에 들어오면 data-in 을 붙인다. 움직임 자체는 CSS(globals.css 의 .m-*)가 맡는다.
 * 한 번 들어오면 다시 빼지 않는다 — 스크롤을 오르내려도 깜빡이지 않게.
 * JS 가 없거나 늦어도 내용은 보인다: 기본 상태를 CSS 가 숨기되 .site-theme[data-js] 안에서만.
 */
export function Reveal({
  children,
  className,
  style,
  as: Tag = "div",
  threshold = 0.2,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "ul" | "li" | "header";
  threshold?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.closest(".site-theme")?.setAttribute("data-js", "");
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-in", "");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute("data-in", "");
            io.disconnect();
          }
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = Tag as any;
  return (
    <Comp ref={ref} className={className} style={style}>
      {children}
    </Comp>
  );
}
