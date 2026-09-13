import { LoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next?.startsWith("/admin") && !params.next.startsWith("//")
      ? params.next
      : "/admin";

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold tracking-tight text-zinc-500">
          ADMIN
        </p>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900">로그인</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Supabase Auth 계정으로 관리자 화면에 접속합니다.
        </p>
        <div className="mt-8">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
