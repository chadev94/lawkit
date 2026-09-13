export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm font-semibold tracking-tight">YOO &amp; PARTNERS</p>

        <div className="mt-6 grid gap-8 text-xs text-zinc-500 sm:grid-cols-3">
          <dl className="space-y-1">
            <div className="flex gap-2">
              <dt className="w-12 shrink-0">주소</dt>
              <dd className="text-zinc-400">—</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-12 shrink-0">전화</dt>
              <dd className="text-zinc-400">—</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-12 shrink-0">이메일</dt>
              <dd className="text-zinc-400">—</dd>
            </div>
          </dl>

          <div className="space-y-1">
            <p className="text-zinc-400">사업자등록번호 —</p>
            <p className="text-zinc-400">대표변호사 —</p>
          </div>

          <div className="space-y-1">
            <p className="text-zinc-400">개인정보처리방침</p>
          </div>
        </div>

        <p className="mt-8 text-xs text-zinc-400">
          © {new Date().getFullYear()} YOO &amp; PARTNERS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
