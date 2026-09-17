"use client";

import { useEffect, useState } from "react";

export type ToastKind = "ok" | "error";

export type ToastInput = {
  message: string;
  kind?: ToastKind;
  /** 있으면 "사이트에서 보기" 같은 링크를 붙인다 */
  link?: { href: string; label: string };
};

type Toast = ToastInput & { id: number; kind: ToastKind };

const EVENT = "lawkit-admin-toast";

/**
 * 어디서든 호출한다. 어드민 껍데기의 <AdminToaster /> 가 받아 그린다.
 * 저장·삭제·순서 변경처럼 화면이 바로 반응해야 하는 동작 뒤에 쓴다.
 */
export function toast(input: ToastInput) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastInput>(EVENT, { detail: input }));
}

export function AdminToaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    let seq = 0;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastInput>).detail;
      const id = ++seq;
      const item: Toast = { ...detail, id, kind: detail.kind ?? "ok" };
      setItems((prev) => [...prev.slice(-2), item]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, item.kind === "error" ? 6000 : 3200);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="a-toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="a-toast" data-kind={t.kind}>
          <i aria-hidden="true" />
          <span>{t.message}</span>
          {t.link && (
            <a href={t.link.href} target="_blank" rel="noreferrer">
              {t.link.label}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
