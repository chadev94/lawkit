import "./admin.css";
import { ADMIN_THEME_KEY } from "./admin-theme";

/**
 * 어드민 공통 껍데기.
 * admin.css 의 토큰은 .admin-shell 안에서만 살아, 공개 사이트 테마와 섞이지 않는다.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 아래 스크립트가 hydration 전에 data-theme 를 붙이므로, 그 속성 차이는 경고하지 않게 한다.
    <div className="admin-shell" suppressHydrationWarning>
      {/* 첫 그림 전에 저장된 밝기를 적용한다. 없으면 시스템 설정을 따른다. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{var m=localStorage.getItem(${JSON.stringify(ADMIN_THEME_KEY)});if(m==="light"||m==="dark"){document.currentScript.parentElement.dataset.theme=m}}catch(e){}`,
        }}
      />
      {children}
    </div>
  );
}
