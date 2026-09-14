import { createClient } from "@supabase/supabase-js";

/**
 * 공개 읽기 전용 클라이언트.
 * 쿠키/세션을 쓰지 않아 공개 라우트가 static/ISR 캐시를 탈 수 있다.
 * RLS(anon SELECT)만으로 충분한 쿼리에만 사용한다.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
