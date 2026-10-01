"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteLogo } from "@/components/site/site-logo";
import { pagePath } from "@/lib/sections";

type NavPage = {
  id: string;
  title: string;
  slug: string;
};

/**
 * 고정 헤더. 히어로 위에서는 투명+밝은 글자, 스크롤하면 면이 생긴다.
 * md 미만에서는 메뉴 대신 햄버거 버튼 → 아래로 패널이 열린다.
 * 요파트너스 `.nav` / `.nav.scrolled` 와 같은 레이아웃 역할.
 */
export function SiteHeaderBar({
  siteName,
  pages,
}: {
  siteName: string;
  pages: NavPage[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 페이지를 이동하면 패널을 닫는다.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // 패널이 열려 있으면 헤더도 면을 가져야 패널과 한 덩어리로 보인다.
  const solid = scrolled || open;

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="site-nav fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300"
      style={
        solid
          ? {
              background: "color-mix(in srgb, var(--background) 96%, transparent)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 1px 0 var(--border)",
            }
          : { background: "transparent" }
      }
    >
      <div className="mx-auto flex h-[var(--site-nav-h,4.75rem)] max-w-6xl items-center justify-between px-6 sm:px-8">
        <Link
          href="/"
          data-field="content.site_name"
          aria-label={siteName}
          className="inline-flex items-center transition-colors hover:opacity-90"
          style={{ color: "var(--primary)" }}
        >
          <SiteLogo title={siteName} className="h-9 w-auto sm:h-10" />
        </Link>

        <nav className="hidden gap-6 md:flex">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={pagePath(page.slug)}
              data-field={`nav.${page.id}`}
              className="text-sm transition-colors hover:opacity-80"
              style={{
                color: scrolled
                  ? "var(--muted-foreground)"
                  : "color-mix(in srgb, var(--hero-foreground) 70%, transparent)",
              }}
            >
              {page.title}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center md:hidden"
          style={{
            color: solid
              ? "var(--foreground)"
              : "var(--hero-foreground)",
          }}
        >
          {/* 3선 ↔ X. 가운데 선은 사라지고 위아래 선이 기울어진다. */}
          <span aria-hidden className="relative block h-3.5 w-5">
            <span
              className="absolute left-0 top-0 h-px w-full bg-current transition-transform duration-200"
              style={
                open ? { transform: "translateY(6.5px) rotate(45deg)" } : undefined
              }
            />
            <span
              className="absolute left-0 top-1/2 h-px w-full bg-current transition-opacity duration-200"
              style={open ? { opacity: 0 } : undefined}
            />
            <span
              className="absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-200"
              style={
                open
                  ? { transform: "translateY(-6.5px) rotate(-45deg)" }
                  : undefined
              }
            />
          </span>
        </button>
      </div>

      {open && (
        <nav
          className="md:hidden"
          style={{
            background: "color-mix(in srgb, var(--background) 96%, transparent)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 1px 0 var(--border)",
          }}
        >
          <div className="mx-auto flex max-w-6xl flex-col px-6 sm:px-8 pb-4 pt-1">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={pagePath(page.slug)}
                data-field={`nav.${page.id}`}
                onClick={() => setOpen(false)}
                className="border-b py-3.5 text-sm last:border-b-0"
                style={{
                  color: "var(--foreground)",
                  borderColor: "var(--border)",
                }}
              >
                {page.title}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
