import { createBrowserClient } from "@supabase/ssr";

/**
 * 브라우저(Client Component)에서 쓰는 Supabase 클라이언트.
 *
 * anon key를 사용하므로 브라우저에 노출되는 것이 정상이다.
 * 이 키로 무엇을 할 수 있는지는 RLS 정책이 결정한다.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
