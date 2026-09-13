"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function createSection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const kind = String(formData.get("kind") ?? "");
  const menuId = String(formData.get("menu_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const layout = String(formData.get("layout") ?? "cards");
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (kind === "menu" && !menuId) {
    return { error: "메뉴 연결 섹션은 메뉴를 선택해야 합니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("home_sections").insert({
    kind,
    menu_id: kind === "menu" ? menuId : null,
    title: title || null,
    subtitle: subtitle || null,
    layout,
    sort_order: sortOrder,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/sections");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function toggleSection(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("home_sections")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/sections");
  revalidatePath("/", "layout");
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("home_sections").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/sections");
  revalidatePath("/", "layout");
}
