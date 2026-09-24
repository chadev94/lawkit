import { createClient } from "@supabase/supabase-js";

/**
 * RLS 를 우회하는 서버 전용 클라이언트.
 *
 * 비밀 키(service role)를 쓴다. 이 키는 브라우저에 나가면 DB 전체가 열리므로
 *   - NEXT_PUBLIC_ 접두어를 절대 붙이지 않는다
 *   - 서버 액션·라우트 핸들러에서만 import 한다. 클라이언트 컴포넌트에서 import 하면 빌드가 실패해야 정상
 *   - 필요한 곳(상담 신청 insert 등)에서만 쓰고, 읽기는 늘 일반 클라이언트로 한다
 *
 * 키가 비어 있으면 null. 호출한 쪽이 사용자에게 "설정 누락"을 알린다.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient 는 서버에서만 쓴다.");
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
