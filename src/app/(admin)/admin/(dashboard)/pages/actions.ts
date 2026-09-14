"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase/server";
import { HOME_PAGE_SLUG, pagePath } from "@/lib/sections";

export type ActionState = { error: string | null };

const SLUG_PATTERN = /^[a-z0-9-]+$/;
// 앱 라우트와 충돌하는 경로. 홈은 별도 행이 이미 있으므로 새로 만들 수 없다.
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

function revalidateAll(...slugs: string[]) {
  revalidateTag(CACHE_TAGS.pages, "max");
  revalidatePath("/admin/pages");
  revalidatePath("/admin/sections");
  revalidatePath("/", "layout");
  for (const slug of slugs) {
    if (slug) {
      revalidateTag(`${CACHE_TAGS.pages}:${slug}`, "max");
      revalidatePath(pagePath(slug));
    }
  }
}

export async function createPage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const showInNav = formData.get("show_in_nav") === "on";

  if (!title) return { error: "페이지 이름을 입력하세요." };
  const slugError = validateSlug(slug);
  if (slugError) return { error: slugError };
  if (Number.isNaN(sortOrder)) return { error: "순서는 숫자여야 합니다." };

  const supabase = await createClient();
  const { error } = await supabase.from("pages").insert({
    title,
    slug,
    sort_order: sortOrder,
    show_in_nav: showInNav,
    is_active: true,
  });

  if (error) {
    if (error.code === "23505") return { error: "이미 사용 중인 경로입니다." };
    return { error: error.message };
  }

  revalidateAll(slug);
  return { error: null };
}

export async function updatePage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const isActive = formData.get("is_active") === "true";
  const showInNav = formData.get("show_in_nav") === "on";
  const previousSlug = String(formData.get("previous_slug") ?? "").trim();

  if (!id) return { error: "페이지를 찾을 수 없습니다." };
  if (!title) return { error: "페이지 이름을 입력하세요." };
  if (Number.isNaN(sortOrder)) return { error: "순서는 숫자여야 합니다." };

  // 홈은 경로가 '/' 에 고정되어 있으므로 slug 를 바꿀 수 없다
  const isHome = previousSlug === HOME_PAGE_SLUG;
  if (isHome && slug !== HOME_PAGE_SLUG) {
    return { error: "홈 페이지의 경로는 바꿀 수 없습니다." };
  }
  if (!isHome) {
    const slugError = validateSlug(slug);
    if (slugError) return { error: slugError };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("pages")
    .update({
      title,
      slug,
      sort_order: sortOrder,
      is_active: isActive,
      show_in_nav: showInNav,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "이미 사용 중인 경로입니다." };
    return { error: error.message };
  }

  revalidateAll(slug, previousSlug !== slug ? previousSlug : "");
  return { error: null };
}

export async function togglePage(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error) throw error;
  revalidateAll(data?.slug ?? "");
}

export async function deletePage(id: string) {
  const supabase = await createClient();

  // 홈은 지울 수 없다. 사이트 진입점이다.
  const { data: page } = await supabase
    .from("pages")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (page?.slug === HOME_PAGE_SLUG) {
    throw new Error("홈 페이지는 삭제할 수 없습니다.");
  }

  // page_sections 는 page_id / source_page_id 모두 on delete cascade 로 정리된다.
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) throw error;

  revalidateAll(page?.slug ?? "");
}
