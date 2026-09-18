"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteLogo } from "@/components/site/site-logo";
import { pagePath } from "@/lib/sections";

type NavPage = {
  id: string;
  title: string;
  slug: string;
};

/**
 * 고정 헤더. 히어로 위에서는 투명+밝은 글자, 스크롤하면 면이 생긴다.
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="site-nav fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300"
      style={
        scrolled
          ? {
              background: "color-mix(in srgb, var(--background) 96%, transparent)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 1px 0 var(--border)",
            }
          : { background: "transparent" }
      }
    >
      <div className="mx-auto flex h-[var(--site-nav-h,4.75rem)] max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          data-field="content.site_name"
          aria-label={siteName}
          className="inline-flex items-center transition-colors hover:opacity-90"
          style={{ color: "var(--primary)" }}
        >
          <SiteLogo title={siteName} className="h-9 w-auto sm:h-10" />
        </Link>

        <nav className="flex gap-6">
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
      </div>
    </header>
  );
}
