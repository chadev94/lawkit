/**
 * 버튼 하나로 끝나는 서버 액션(숨김·삭제·순서)의 결과.
 * throw 하면 운영에서는 메시지가 가려진 채 에러 화면으로 떨어지므로, 값으로 돌려준다.
 */
export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; code?: "unauthorized" };

export const UNAUTHORIZED: ActionResult = {
  ok: false,
  error: "로그인이 풀렸습니다. 다시 로그인한 뒤 시도하세요.",
  code: "unauthorized",
};
