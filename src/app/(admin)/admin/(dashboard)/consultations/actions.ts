"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isConsultationStatus } from "@/lib/consultation";
import {
  UNAUTHORIZED,
  type ActionResult,
} from "@/app/(admin)/admin/action-result";

const PATH = "/admin/consultations";

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ? supabase : null;
}

/**
 * 목록에서 한 건을 연다. "새 문의"였다면 "확인함"으로 바꾼 뒤 상세로 간다.
 * 읽기(GET)에서 상태를 바꾸지 않으려고 버튼(POST)으로 연다.
 */
export async function openConsultation(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect(PATH);

  const supabase = await requireUser();
  if (!supabase) redirect("/admin/login");

  await supabase
    .from("consultation_requests")
    .update({ status: "read" })
    .eq("id", id)
    .eq("status", "new");

  revalidatePath(PATH);
  redirect(`${PATH}?id=${id}`);
}

export async function setConsultationStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  if (!isConsultationStatus(status)) return { ok: false, error: "잘못된 상태입니다." };
  const supabase = await requireUser();
  if (!supabase) return UNAUTHORIZED;

  const { error } = await supabase
    .from("consultation_requests")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(PATH);
  return { ok: true };
}
