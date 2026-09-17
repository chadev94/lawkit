"use client";

import { useEffect, useRef, useState } from "react";
import type { PageSectionItem } from "@/lib/sections";
import { mediaPublicUrl } from "@/lib/section-content";
import { splitResult } from "./result";

/**
 * 스크롤 스토리. 왼쪽 글은 고정되고 오른쪽 이미지가 스크롤에 따라 바뀐다.
 * 이미지가 화면 가운데에 오면 왼쪽 글이 그 항목으로 바뀐다.
 * 폰(768px 미만)에서는 고정 없이 세로로 나열한다(CSS).
 */
export function StoryScroller({ items }: { items: PageSectionItem[] }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const steps = [...el.querySelectorAll<HTMLElement>("[data-step]")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute("data-in", entry.isIntersecting);
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.step));
          }
        }
      },
      { threshold: 0.6 },
    );
    steps.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items.length]);

  const cur = items[active] ?? items[0];
  const res = splitResult(cur?.subtitle);

  return (
    <div ref={root} className="m-story">
      <div className="m-story-pin">
        <p className="m-story-k">
          {active + 1} / {items.length}
        </p>
        <h3 className="m-story-h">{cur?.title ?? ""}</h3>
        {res && (
          <p className="m-story-r">
            {res.from && <span className="m-from">{res.from}</span>}
            <span className="m-to">{res.to}</span>
          </p>
        )}
        {cur?.body && <p className="m-story-p">{cur.body}</p>}
        <div className="m-story-dots" aria-hidden="true">
          {items.map((it, i) => (
            <i key={it.id} data-on={i === active || undefined} />
          ))}
        </div>
      </div>
      <div className="m-story-steps">
        {items.map((item, i) => (
          <div key={item.id} className="m-story-step" data-step={i}>
            {item.image_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaPublicUrl(item.image_path) ?? ""} alt="" />
            ) : (
              <div className="m-story-empty">{item.title}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
