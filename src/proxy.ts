import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 정적 파일은 제외.
     * 공개 페이지도 proxy 함수는 타지만, updateSession 이 /admin 외에는 즉시 next 한다.
     * matcher 를 /admin 만으로 좁히면 로그인 쿠키 갱신 기회를 잃을 수 있어
     * 함수 내부에서 분기한다.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
