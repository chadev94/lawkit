import { createClient } from "@/lib/supabase/server";
import type { ConsultationStatus } from "@/lib/consultation";

/**
 * 상담 접수 조회. 어드민 전용 — 쿠키 세션의 클라이언트를 쓰므로 RLS(authenticated select)를 탄다.
 * 공개 사이트는 이 파일을 쓰지 않는다.
 */

export type ConsultationRequest = {
  id: string;
  page_section_id: string | null;
  answers: Record<string, string>;
  consented_at: string;
  status: ConsultationStatus;
  created_at: string;
};

const LIST_LIMIT = 200;

export async function getConsultationRequests(): Promise<ConsultationRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultation_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT);
  if (error) throw error;
  return (data ?? []) as ConsultationRequest[];
}

export async function getConsultationRequest(
  id: string,
): Promise<ConsultationRequest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultation_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as ConsultationRequest | null) ?? null;
}

/** 상단 바 배지. 아직 안 본 건수. */
export async function countNewConsultations(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("consultation_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");
  if (error) return 0;
  return count ?? 0;
}

/**
 * field_key → 칸 이름. 모든 상담 블록의 항목을 훑는다(숨긴 항목 포함 — 옛 접수의 이름을 찾기 위해).
 * 같은 키가 여러 블록에 있으면 먼저 온 것이 이긴다.
 */
export async function getConsultationFieldLabels(): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_section_items")
    .select("id, title, meta, sort_order, page_section:page_sections!inner(kind)")
    .eq("page_section.kind", "contact")
    .order("sort_order");
  if (error) throw error;

  const labels = new Map<string, string>();
  for (const row of data ?? []) {
    const meta = (row.meta ?? {}) as Record<string, unknown>;
    const key =
      typeof meta.field_key === "string" && meta.field_key ? meta.field_key : row.id;
    if (!labels.has(key)) labels.set(key, row.title?.trim() || "항목");
  }
  return labels;
}
