"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { HOME_PAGE_SLUG, pagePath } from "@/lib/sections";

export type ActionState = { error: string | null };

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const RESERVED_SLUGS = new Set(["admin", "api", "login", HOME_PAGE_SLUG]);

function validateSlug(slug: string): string | null {
  if (!SLUG_PATTERN.test(slug)) {
    return "경로는 소문자, 숫자, 하이픈만 사용할 수 있습니다.";
  }
  if (RESERVED_SLUGS.has(slug)) {
    return `"${slug}" 는 예약된 경로입니다.`;
  }
  return null;
}

/**
 * 메뉴 등록 + 대응 pages 행 생성.
 */
export async function createMenu(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!name) return { error: "메뉴명을 입력하세요." };
  const slugError = validateSlug(slug);
  if (slugError) return { error: slugError };

  const supabase = await createClient();
  const { data: menu, error } = await supabase
    .from("menus")
    .insert({ name, slug, sort_order: sortOrder })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "이미 사용 중인 경로입니다." };
    return { error: error.message };
  }

  const { error: pageError } = await supabase.from("pages").insert({
    slug,
    title: name,
    menu_id: menu.id,
    sort_order: sortOrder,
    is_active: true,
  });

  if (pageError) {
    await supabase.from("menus").delete().eq("id", menu.id);
    if (pageError.code === "23505") {
      return { error: "이미 사용 중인 페이지 경로입니다." };
    }
    return { error: pageError.message };
  }

  revalidatePath("/admin/menus");
  revalidatePath("/admin/sections");
  revalidatePath("/", "layout");
  revalidatePath(pagePath(slug));
  return { error: null };
}

export async function updateMenu(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const isActive = formData.get("is_active") === "true";
  const previousSlug = String(formData.get("previous_slug") ?? "").trim();

  if (!id) return { error: "메뉴를 찾을 수 없습니다." };
  if (!name) return { error: "메뉴명을 입력하세요." };
  const slugError = validateSlug(slug);
  if (slugError) return { error: slugError };
  if (Number.isNaN(sortOrder)) return { error: "순서는 숫자여야 합니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("menus")
    .update({
      name,
      slug,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "이미 사용 중인 경로입니다." };
    return { error: error.message };
  }

  const { error: pageError } = await supabase
    .from("pages")
    .update({
      slug,
      title: name,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .eq("menu_id", id);

  if (pageError) {
    if (pageError.code === "23505") {
      return { error: "이미 사용 중인 페이지 경로입니다." };
    }
    return { error: pageError.message };
  }

  revalidatePath("/admin/menus");
  revalidatePath("/admin/sections");
  revalidatePath("/", "layout");
  revalidatePath(pagePath(slug));
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(pagePath(previousSlug));
  }
  return { error: null };
}

export async function toggleMenu(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("menus")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw error;

  await supabase.from("pages").update({ is_active: isActive }).eq("menu_id", id);

  revalidatePath("/admin/menus");
  revalidatePath("/admin/sections");
  revalidatePath("/", "layout");
}

export async function deleteMenu(id: string) {
  const supabase = await createClient();
  // pages.menu_id on delete cascade 로 페이지·섹션도 정리된다.
  const { data, error } = await supabase
    .from("menus")
    .delete()
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error) throw error;

  revalidatePath("/admin/menus");
  revalidatePath("/admin/sections");
  revalidatePath("/", "layout");
  if (data?.slug) revalidatePath(pagePath(data.slug));
}
