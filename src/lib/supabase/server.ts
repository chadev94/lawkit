import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 서버(Server Component, Server Action, Route Handler)에서 쓰는 Supabase 클라이언트.
 *
 * 쿠키로 세션을 읽어 로그인 상태를 유지한다. anon key를 쓰므로 RLS가 적용된다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서는 쿠키를 쓸 수 없다.
            // 세션 갱신은 middleware가 담당하므로 무시해도 된다.
          }
        },
      },
    },
  );
}
