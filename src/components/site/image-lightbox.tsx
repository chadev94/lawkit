"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/**
 * 썸네일을 누르면 같은 이미지를 크게 보는 모달.
 * 링크 카드 안에서는 버튼이 <a> 자식이 되지 않게 — 이미지와 링크를 형제로 둔다.
 */
export function LightboxImage({
  src,
  alt = "",
  className,
  imgClassName,
  loading,
}: {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className={className}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={alt ? `${alt} 크게 보기` : "이미지 크게 보기"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imgClassName} loading={loading} />
      </button>
      {open && <LightboxModal src={src} alt={alt} onClose={close} />}
    </>
  );
}

function LightboxModal({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    prevFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const nodes = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const list = [...nodes].filter((el) => !el.hasAttribute("disabled"));
      if (list.length === 0) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus.current?.focus?.();
    };
  }, [onClose]);

  const modal: ReactNode = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0"
        style={{
          background:
            "color-mix(in srgb, var(--foreground) 78%, transparent)",
        }}
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92vh,56rem)] max-w-[min(94vw,60rem)] flex-col items-center outline-none"
      >
        <p id={titleId} className="sr-only">
          {alt || "확대 이미지"}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute -top-11 right-0 rounded-md px-2.5 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
        >
          닫기 ✕
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[min(85vh,52rem)] max-w-full rounded-sm object-contain"
          style={{ boxShadow: "0 24px 64px -24px rgba(0, 0, 0, 0.55)" }}
        />
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
