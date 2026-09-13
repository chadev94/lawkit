"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

/**
 * 메뉴 등록.
 *
 * 인증은 아직 붙지 않았다. RLS가 authenticated 롤에만 쓰기를 허용하므로
 * 로그인 기능이 들어오기 전까지 이 동작은 실패한다. (YP-4)
 */
export async function createMenu(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!name) return { error: "메뉴명을 입력하세요." };
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "경로는 소문자, 숫자, 하이픈만 사용할 수 있습니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("menus")
    .insert({ name, slug, sort_order: sortOrder });

  if (error) {
    if (error.code === "23505") return { error: "이미 사용 중인 경로입니다." };
    return { error: error.message };
  }

  revalidatePath("/admin/menus");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function toggleMenu(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("menus")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/menus");
  revalidatePath("/", "layout");
}

export async function deleteMenu(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("menus").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/menus");
  revalidatePath("/", "layout");
}
