// 새 상담 접수를 변호사에게 이메일로 알린다. Resend REST API 를 fetch 로 호출한다.
// 서버 전용: RESEND_API_KEY 를 읽는다. 클라이언트 컴포넌트에서 import 하지 않는다.
//
// 개인정보: 메일에는 상담 내용(answers)을 넣지 않는다. 접수 사실과 어드민 링크만 보낸다.
// 외부 메일 서비스의 로그·수신함에 사건 내용이 남지 않게 하기 위해서다 (docs/consultation.md).

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * 알림 발송. 실패해도 던지지 않는다 — 접수 자체는 이미 저장된 뒤라서,
 * 알림이 죽었다고 신청자에게 에러를 보여줄 이유가 없다.
 *
 * RESEND_API_KEY / CONSULTATION_NOTIFY_TO / CONSULTATION_NOTIFY_FROM 중
 * 하나라도 없으면 알림 기능이 꺼진 것으로 보고 조용히 넘어간다.
 */
export async function notifyNewConsultation(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONSULTATION_NOTIFY_TO;
  const from = process.env.CONSULTATION_NOTIFY_FROM;
  if (!apiKey || !to || !from) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const inboxUrl = `${siteUrl.replace(/\/$/, "")}/admin/consultations`;
  const receivedAt = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date());

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "새 상담 신청이 접수되었습니다",
        text: [
          `새 상담 신청이 접수되었습니다. (${receivedAt})`,
          "",
          `접수함에서 확인: ${inboxUrl}`,
          "",
          "개인정보 보호를 위해 상담 내용은 메일에 담지 않습니다.",
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error("상담 알림 메일 발송 실패", res.status, await res.text());
    }
  } catch (e) {
    console.error("상담 알림 메일 발송 실패", e instanceof Error ? e.message : e);
  }
}
