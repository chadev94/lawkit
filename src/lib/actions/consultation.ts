"use server";
// "use server" 파일은 async 함수만 내보낼 수 있다. 상수·타입은 @/lib/consultation 에 둔다.

import { headers } from "next/headers";
import {
  CONSULTATION_HONEYPOT,
  fieldsFromSection,
  validateAnswers,
  type ConsultationState,
} from "@/lib/consultation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import type { PageSectionItem } from "@/lib/sections";

/* ── 같은 IP 분당 횟수 제한. 서버 인스턴스 메모리라 완벽하진 않지만 도배는 걸러진다. ── */
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 5;
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // 메모리가 자라지 않게
  return recent.length > RATE_LIMIT;
}

function fail(message: string, errors: Record<string, string> = {}): ConsultationState {
  return { status: "error", message, errors };
}

/**
 * 상담 신청. 폼 → 이 함수 → 검사 → consultation_requests insert.
 *
 * 검사 기준은 코드가 아니라 "지금" DB 에 있는 상담 블록의 항목이다.
 * 관리자가 칸을 늘리거나 필수를 바꾸면 다음 요청부터 그대로 적용된다.
 * 브라우저의 required 는 편의일 뿐, 여기서 다시 본다.
 */
export async function submitConsultation(
  _prev: ConsultationState,
  formData: FormData,
): Promise<ConsultationState> {
  const sectionId = String(formData.get("section_id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(sectionId)) return fail("잘못된 요청입니다.");

  // 봇: 사람에겐 보이지 않는 칸이 채워져 있으면 조용히 버린다.
  if (String(formData.get(CONSULTATION_HONEYPOT) ?? "") !== "") {
    return { status: "ok", message: null, errors: {} };
  }

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) return fail("요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.");

  if (formData.get("consent") !== "on") {
    return fail("개인정보 수집·이용에 동의해 주세요.", { consent: "동의가 필요합니다." });
  }

  // 지금 시점의 칸 정의. 공개 키로 읽는다(활성 블록의 활성 항목만 보인다).
  const supabase = createPublicClient();
  const { data: section, error: readError } = await supabase
    .from("page_sections")
    .select("id, kind, is_active, items:page_section_items(*)")
    .eq("id", sectionId)
    .eq("kind", "contact")
    .eq("is_active", true)
    .maybeSingle();
  if (readError || !section) return fail("상담 폼을 찾을 수 없습니다.");

  const fields = fieldsFromSection({
    items: (section.items ?? []) as PageSectionItem[],
  });
  if (fields.length === 0) return fail("입력 항목이 아직 준비되지 않았습니다.");

  // 봉투 열기: 폼의 answers.<key> 만 모은다. 그 외 칸은 검사에서 "알 수 없는 항목"으로 걸린다.
  const raw: Record<string, unknown> = {};
  for (const [name, value] of formData.entries()) {
    if (name.startsWith("answers.") && typeof value === "string") {
      raw[name.slice("answers.".length)] = value;
    }
  }

  const checked = validateAnswers(fields, raw);
  if (!checked.ok) return fail("입력 내용을 확인해 주세요.", checked.errors);

  const admin = createAdminClient();
  if (!admin) {
    console.error("SUPABASE_SERVICE_ROLE_KEY 가 없어 상담 신청을 저장할 수 없다.");
    return fail("지금은 접수할 수 없습니다. 전화로 연락해 주세요.");
  }

  const { error } = await admin.from("consultation_requests").insert({
    page_section_id: section.id,
    answers: checked.answers,
    consented_at: new Date().toISOString(),
  });
  if (error) {
    console.error("consultation_requests insert 실패", error.message);
    return fail("접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.");
  }

  return { status: "ok", message: null, errors: {} };
}
