"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDirty, UNSAVED_MESSAGE } from "@/app/(admin)/admin/unsaved";

const TABS = [
  { href: "/admin/sections", label: "화면" },
  { href: "/admin/pages", label: "페이지 · 메뉴" },
  { href: "/admin/settings", label: "사이트 설정" },
];

const INBOX = { href: "/admin/consultations", label: "상담 접수" };

/**
 * 상단 바. 편집 대상이 셋뿐이라 사이드바 대신 탭 하나로 둔다.
 * 탭을 바꿔도 아래 미리보기는 같은 사이트가 그대로 있고, 왼쪽 편집 패널만 바뀐다.
 *
 * 세 탭은 "사이트를 어떻게 보이게 할까"(설정)이고, 상담 접수는 "들어온 일"(업무)이다.
 * 성격이 달라 같은 알약에 넣지 않고 구분선 뒤에 따로 세운다. 업무가 늘면 그 옆에 붙인다.
 */
export function AdminTopBar({
  siteName,
  email,
  newConsultations,
  logout,
}: {
  siteName: string;
  email: string | null;
  /** 아직 안 본 상담 건수. 0 이면 배지를 숨긴다 */
  newConsultations: number;
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const inboxActive = pathname.startsWith(INBOX.href);
  const guard = (active: boolean) => (e: React.MouseEvent) => {
    // 편집 중이면 떠나기 전에 한 번 묻는다. 입력을 말없이 잃지 않게.
    if (!active && isDirty() && !window.confirm(UNSAVED_MESSAGE)) {
      e.preventDefault();
    }
  };

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
              onClick={guard(active)}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <span className="a-topbar-divider" aria-hidden="true" />

      <Link
        href={INBOX.href}
        className="a-work"
        data-active={inboxActive || undefined}
        aria-current={inboxActive ? "page" : undefined}
        onClick={guard(inboxActive)}
      >
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 4h16v12H8l-4 4z" />
        </svg>
        {INBOX.label}
        {newConsultations > 0 && (
          <span className="a-newcount" aria-label={`새 문의 ${newConsultations}건`}>
            {newConsultations > 99 ? "99+" : newConsultations}
          </span>
        )}
      </Link>

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
