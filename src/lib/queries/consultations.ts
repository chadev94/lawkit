import { createClient } from "@/lib/supabase/server";
import { escapeLike, type ConsultationStatus } from "@/lib/consultation";

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
  /** 변호사 메모. 방문자가 쓴 answers 와 분리 */
  note: string | null;
  note_updated_at: string | null;
};

const COLUMNS = "id, page_section_id, answers, consented_at, status, created_at, note, note_updated_at";

export const CONSULTATION_PAGE_SIZE = 50;

export type ConsultationListQuery = {
  status: ConsultationStatus | null;
  /** 1부터 */
  page: number;
  /** 검색어. answers 전체 · 숫자만 · 메모에서 찾는다 */
  q: string | null;
};

/** 목록 한 페이지. total 은 필터 적용 후 전체 건수(페이지 이동 계산용). */
export async function getConsultationRequests({
  status,
  page,
  q,
}: ConsultationListQuery): Promise<{ rows: ConsultationRequest[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * CONSULTATION_PAGE_SIZE;
  let query = supabase
    .from("consultation_requests")
    .select(COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + CONSULTATION_PAGE_SIZE - 1);
  if (status) query = query.eq("status", status);
  if (q) query = query.ilike("search", `%${escapeLike(q.toLowerCase())}%`);
  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: (data ?? []) as ConsultationRequest[], total: count ?? 0 };
}

/** 필터 칩의 숫자. 상태별 건수와 전체. 검색 중이면 검색 결과 안에서 센다. */
export async function countConsultationsByStatus(
  q: string | null,
): Promise<Record<ConsultationStatus | "all", number>> {
  const supabase = await createClient();
  let query = supabase.from("consultation_requests").select("status");
  if (q) query = query.ilike("search", `%${escapeLike(q.toLowerCase())}%`);
  const { data, error } = await query;
  if (error) throw error;
  const counts = { all: 0, new: 0, read: 0, done: 0 };
  for (const row of data ?? []) {
    const st = row.status as ConsultationStatus;
    if (st in counts) counts[st] += 1;
    counts.all += 1;
  }
  return counts;
}

export async function getConsultationRequest(
  id: string,
): Promise<ConsultationRequest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultation_requests")
    .select(COLUMNS)
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
