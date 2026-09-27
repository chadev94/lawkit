"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEBOUNCE_MS = 250;

/**
 * 검색창. 치는 대로 결과가 바뀐다.
 * 입력이 멈추고 250ms 뒤에 주소(?q=)를 바꾸면 서버가 목록을 다시 그린다.
 * 주소에 남으므로 새로고침·뒤로가기·공유가 그대로 된다. Enter 는 기다리지 않고 바로.
 * 검색이 바뀌면 페이지는 1로, 열어 둔 상세(id)는 닫는다 — 결과에 없을 수 있어서.
 */
export function SearchBox({ initial }: { initial: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  const timer = useRef<number | null>(null);
  const applied = useRef(initial);

  function apply(q: string) {
    const trimmed = q.trim();
    if (trimmed === applied.current) return;
    applied.current = trimmed;
    const next = new URLSearchParams(params.toString());
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("page");
    next.delete("id");
    const qs = next.toString();
    start(() => router.replace(qs ? `${pathname}?${qs}` : pathname));
  }

  function onChange(q: string) {
    setValue(q);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => apply(q), DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <form
      role="search"
      className="a-search"
      data-pending={pending || undefined}
      onSubmit={(e) => {
        e.preventDefault();
        if (timer.current) window.clearTimeout(timer.current);
        apply(value);
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="이름 · 번호 · 이메일 · 내용"
        aria-label="검색"
        maxLength={100}
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            if (timer.current) window.clearTimeout(timer.current);
            apply("");
          }}
          className="a-search-clear"
          aria-label="검색 지우기"
        >
          ×
        </button>
      )}
    </form>
  );
}
