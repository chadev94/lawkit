export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // TODO: 인증 가드 — 로그인하지 않았으면 /admin/login 으로
  return (
    <div>
      {/* TODO: 관리자 사이드바 */}
      {children}
    </div>
  );
}
