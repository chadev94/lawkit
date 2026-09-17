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
      <div className="a-card w-full max-w-sm p-7">
        <p
          className="text-[11px] font-bold tracking-[0.14em]"
          style={{ color: "var(--a-ink-3)" }}
        >
          ADMIN
        </p>
        <h1 className="a-title mt-2 text-2xl">로그인</h1>
        <p className="a-lead mt-1">
          Supabase Auth 계정으로 관리자 화면에 접속합니다.
        </p>
        <div className="mt-7">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
