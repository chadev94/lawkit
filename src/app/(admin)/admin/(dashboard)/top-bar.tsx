"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDirty, UNSAVED_MESSAGE } from "@/app/(admin)/admin/unsaved";

const TABS = [
  { href: "/admin/sections", label: "화면" },
  { href: "/admin/pages", label: "페이지 · 메뉴" },
  { href: "/admin/settings", label: "사이트 설정" },
];

/**
 * 상단 바. 편집 대상이 셋뿐이라 사이드바 대신 탭 하나로 둔다.
 * 탭을 바꿔도 아래 미리보기는 같은 사이트가 그대로 있고, 왼쪽 편집 패널만 바뀐다.
 */
export function AdminTopBar({
  siteName,
  email,
  logout,
}: {
  siteName: string;
  email: string | null;
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <header className="a-topbar">
      <div className="a-topbar-brand">
        <b title={siteName}>{siteName}</b>
      </div>

      <nav className="a-tabs" aria-label="편집 대상">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              data-active={active || undefined}
              aria-current={active ? "page" : undefined}
              onClick={(e) => {
                // 편집 중이면 떠나기 전에 한 번 묻는다. 입력을 말없이 잃지 않게.
                if (!active && isDirty() && !window.confirm(UNSAVED_MESSAGE)) {
                  e.preventDefault();
                }
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="a-topbar-right">
        <a href="/" target="_blank" rel="noreferrer" className="a-topbar-link">
          사이트 열기 ↗
        </a>
        {email && (
          <>
            <span aria-hidden="true">·</span>
            <span className="who" title={email}>
              {email}
            </span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <form action={logout}>
          <button type="submit" className="a-btn a-btn-quiet a-btn-sm">
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
