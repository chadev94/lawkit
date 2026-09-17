"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase/server";
import {
  UNAUTHORIZED,
  type ActionResult,
} from "@/app/(admin)/admin/action-result";
import { HOME_PAGE_SLUG, pagePath } from "@/lib/sections";

/** field 가 있으면 그 입력칸 옆에 오류를 보여준다(name 속성값). */
export type ActionState = { error: string | null; field?: string };

const SLUG_PATTERN = /^[a-z0-9-]+$/;
// 앱 라우트와 충돌하는 경로. 홈은 별도 행이 이미 있으므로 새로 만들 수 없다.
const RESERVED_SLUGS = new Set(["admin", "api", "login", HOME_PAGE_SLUG]);

function validateSlug(slug: string): string | null {
  if (!SLUG_PATTERN.test(slug)) {
    return "주소는 영문 소문자, 숫자, 하이픈(-)만 쓸 수 있습니다. 예: practice-areas";
  }
  if (RESERVED_SLUGS.has(slug)) {
    return `"${slug}" 는 시스템이 쓰는 주소라 사용할 수 없습니다.`;
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

  if (!title) return { error: "페이지 이름을 입력하세요.", field: "title" };
  const slugError = validateSlug(slug);
  if (slugError) return { error: slugError, field: "slug" };
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
    if (error.code === "23505")
      return { error: "이미 사용 중인 주소입니다.", field: "slug" };
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
  if (!title) return { error: "페이지 이름을 입력하세요.", field: "title" };
  if (Number.isNaN(sortOrder)) return { error: "순서는 숫자여야 합니다." };

  // 홈은 경로가 '/' 에 고정되어 있으므로 slug 를 바꿀 수 없다
  const isHome = previousSlug === HOME_PAGE_SLUG;
  if (isHome && slug !== HOME_PAGE_SLUG) {
    return { error: "홈 페이지의 경로는 바꿀 수 없습니다." };
  }
  if (!isHome) {
    const slugError = validateSlug(slug);
    if (slugError) return { error: slugError, field: "slug" };
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
    if (error.code === "23505")
      return { error: "이미 사용 중인 주소입니다.", field: "slug" };
    return { error: error.message };
  }

  revalidateAll(slug, previousSlug !== slug ? previousSlug : "");
  return { error: null };
}

/** 세션이 살아 있는지. 열어둔 채 한참 뒤 누르면 여기서 걸린다. */
async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ? supabase : null;
}

export async function togglePage(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const supabase = await requireUser();
  if (!supabase) return UNAUTHORIZED;

  const { data, error } = await supabase
    .from("pages")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  if (error)
    return { ok: false, error: `변경에 실패했습니다: ${error.message}` };

  revalidateAll(data?.slug ?? "");
  return { ok: true };
}

/** 페이지를 한 칸 위/아래로. 전체를 다시 번호 매긴 뒤 이웃과 바꾼다. */
export async function movePage(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const supabase = await requireUser();
  if (!supabase) return UNAUTHORIZED;

  const { data, error } = await supabase
    .from("pages")
    .select("id, slug")
    .order("sort_order")
    .order("created_at");
  if (error)
    return { ok: false, error: `순서를 읽지 못했습니다: ${error.message}` };

  const rows = data ?? [];
  const index = rows.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= rows.length) return { ok: true };

  [rows[index], rows[target]] = [rows[target], rows[index]];

  const results = await Promise.all(
    rows.map((row, order) =>
      supabase.from("pages").update({ sort_order: order }).eq("id", row.id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return {
      ok: false,
      error: `순서 변경에 실패했습니다: ${failed.error.message}`,
    };
  }

  revalidateAll(...rows.map((row) => row.slug));
  return { ok: true };
}

/** 페이지에 딸린 블록 수. 삭제 확인 문구에 쓴다. */
export async function countPageSections(pageId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("page_sections")
    .select("id", { count: "exact", head: true })
    .eq("page_id", pageId);
  return count ?? 0;
}

export async function deletePage(id: string): Promise<ActionResult> {
  const supabase = await requireUser();
  if (!supabase) return UNAUTHORIZED;

  // 홈은 지울 수 없다. 사이트 진입점이다.
  const { data: page } = await supabase
    .from("pages")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (page?.slug === HOME_PAGE_SLUG) {
    return { ok: false, error: "홈 페이지는 삭제할 수 없습니다." };
  }

  // page_sections 는 page_id / source_page_id 모두 on delete cascade 로 정리된다.
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error)
    return { ok: false, error: `삭제에 실패했습니다: ${error.message}` };

  revalidateAll(page?.slug ?? "");
  return { ok: true };
}
