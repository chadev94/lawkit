"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * 어드민 화면이 예기치 않게 죽었을 때. Next 기본 에러 화면 대신 사람 말로 안내한다.
 * 저장·삭제 같은 버튼 동작은 여기까지 오지 않고 토스트로 처리된다(run-action.ts).
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 px-6 py-24">
      <div className="a-card flex flex-col gap-3 p-6">
        <h1 className="a-title">화면을 불러오지 못했습니다</h1>
        <p className="a-lead">
          잠시 연결이 끊겼거나 서버가 응답하지 않았습니다. 입력 중이던 내용은
          저장되지 않았을 수 있습니다.
        </p>
        {error.digest && <p className="a-hint">오류 번호 {error.digest}</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" onClick={reset} className="a-btn a-btn-primary">
            다시 시도
          </button>
          <Link href="/admin/sections" className="a-btn a-btn-default">
            화면 구성으로
          </Link>
          <Link href="/admin/login" className="a-btn a-btn-quiet">
            다시 로그인
          </Link>
        </div>
      </div>
    </main>
  );
}
