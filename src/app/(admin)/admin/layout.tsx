import "./admin.css";

/**
 * 어드민 공통 껍데기.
 * admin.css 의 토큰은 .admin-shell 안에서만 살아, 공개 사이트 테마와 섞이지 않는다.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-shell">{children}</div>;
}
