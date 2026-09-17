"use client";

import type { ActionResult } from "./action-result";
import { toast } from "./toast";

/**
 * 서버 액션을 부르고 결과를 토스트로 알린다. 실패해도 화면이 죽지 않는다.
 * 네트워크 끊김처럼 액션 자체가 던지는 경우도 여기서 잡는다.
 */
export async function runAction(
  action: () => Promise<ActionResult>,
  success: { message: string; link?: { href: string; label: string } },
): Promise<boolean> {
  let result: ActionResult;
  try {
    result = await action();
  } catch {
    result = {
      ok: false,
      error: "연결이 끊겼거나 서버가 응답하지 않습니다. 다시 시도하세요.",
    };
  }

  if (result.ok) {
    toast(success);
    return true;
  }

  toast({
    kind: "error",
    message: result.error,
    link:
      result.code === "unauthorized"
        ? { href: "/admin/login", label: "다시 로그인" }
        : undefined,
  });
  return false;
}
