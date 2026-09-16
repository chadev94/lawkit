/**
 * 어드민 밝기 설정 키.
 *
 * 서버 컴포넌트(layout.tsx)와 클라이언트 컴포넌트(theme-toggle.tsx)가 함께 쓴다.
 * "use client" 파일에서 내보낸 값은 서버에서 읽으면 실제 문자열이 아니라
 * 클라이언트 참조가 되므로, 이렇게 중립 모듈에 둔다.
 */
export const ADMIN_THEME_KEY = "lawkit-admin-theme";

export type AdminThemeMode = "light" | "dark" | "system";
