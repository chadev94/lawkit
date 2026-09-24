"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase/server";
import {
  UNAUTHORIZED,
  type ActionResult,
} from "@/app/(admin)/admin/action-result";
import { getSectionByKey } from "@/lib/queries/sections";
import { getPageById } from "@/lib/queries/pages";
import { HOME_PAGE_SLUG, pagePath } from "@/lib/sections";
import {
  contentFromFormData,
  itemsFromFormData,
  type SectionItemInput,
} from "@/lib/section-content";

/** field 가 있으면 그 입력칸 옆에 오류를 보여준다(name 속성값). */
export type ActionState = { error: string | null; field?: string };

async function revalidatePage(pageId: string) {
  const page = await getPageById(pageId);
  revalidateTag(CACHE_TAGS.pageSections, "max");
  revalidateTag(CACHE_TAGS.pages, "max");
  revalidatePath("/admin/sections");
  if (page) {
    revalidateTag(`${CACHE_TAGS.pageSections}:${pageId}`, "max");
    revalidateTag(`${CACHE_TAGS.pages}:${page.slug}`, "max");
    revalidatePath(pagePath(page.slug));
    revalidatePath("/", "layout");
  }
}

/** 버튼 링크. 전화번호를 그대로 넣는 실수가 가장 잦다. */
function validateHref(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^\d/.test(v) || /^0\d[\d-]+$/.test(v)) {
    return "전화번호는 tel: 로 시작해야 합니다. 예: tel:02-000-0000";
  }
  if (!/^(tel:|mailto:|https?:\/\/|\/|#)/.test(v)) {
    return "주소는 / 로 시작하거나 https://, tel:, mailto: 로 시작해야 합니다.";
  }
  return null;
}

/** 여러 content href 필드 중 첫 오류. */
function validateContentHrefs(formData: FormData): ActionState | null {
  for (const field of ["content_cta_href", "content_more_href"] as const) {
    const err = validateHref(String(formData.get(field) ?? ""));
    if (err) return { error: err, field };
  }
  return null;
}

async function syncItems(
  pageSectionId: string,
  items: SectionItemInput[],
): Promise<string | null> {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("page_section_items")
    .delete()
    .eq("page_section_id", pageSectionId);

  if (deleteError) return deleteError.message;
  if (items.length === 0) return null;

  const rows = items.map((item, index) => ({
    page_section_id: pageSectionId,
    sort_order: item.sort_order ?? index,
    title: item.title,
    subtitle: item.subtitle,
    body: item.body,
    href: item.href,
    image_path: item.image_path,
    meta: item.meta ?? {},
    is_active: item.is_active !== false,
  }));

  const { error: insertError } = await supabase
    .from("page_section_items")
    .insert(rows);

  return insertError?.message ?? null;
}

export async function createSection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const pageId = String(formData.get("page_id") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const sourcePageId = String(formData.get("source_page_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const layout = String(formData.get("layout") ?? "cards");
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const content = contentFromFormData(kind, formData);
  const items = itemsFromFormData(formData);

  if (!pageId) return { error: "페이지를 선택하세요." };
  const hrefState = validateContentHrefs(formData);
  if (hrefState) return hrefState;

  const sectionKind = await getSectionByKey(kind);
  if (!sectionKind || !sectionKind.is_active) {
    return { error: "유효하지 않은 섹션 종류입니다." };
  }
  if (sectionKind.requires_page && !sourcePageId) {
    return { error: "이 섹션 종류는 연결할 페이지를 선택해야 합니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .insert({
      page_id: pageId,
      kind,
      source_page_id: sectionKind.requires_page ? sourcePageId : null,
      title: title || null,
      subtitle: subtitle || null,
      layout: sectionKind.requires_page ? layout : "cards",
      sort_order: sortOrder,
      content,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  if (!data) return { error: "섹션 생성에 실패했습니다." };

  if (
    kind === "page_link" ||
    kind === "cta" ||
    kind === "youtube_gallery" ||
    kind === "news_room" ||
    kind === "image_gallery" ||
    kind === "client_reviews" ||
    kind === "contact" ||
    (kind === "hero" && String((content as { variant?: string }).variant ?? "") === "bio")
  ) {
    const itemsError = await syncItems(data.id, items);
    if (itemsError) return { error: itemsError };
  }

  await revalidatePage(pageId);
  return { error: null };
}

export async function updateSection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const pageId = String(formData.get("page_id") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const sourcePageId = String(formData.get("source_page_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const layout = String(formData.get("layout") ?? "cards");
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const isActive = formData.get("is_active") === "true";
  const content = contentFromFormData(kind, formData);
  const items = itemsFromFormData(formData);

  if (!id) return { error: "섹션을 찾을 수 없습니다." };
  if (!pageId) return { error: "페이지를 찾을 수 없습니다." };
  if (Number.isNaN(sortOrder)) {
    return { error: "순서는 숫자여야 합니다." };
  }
  const hrefState = validateContentHrefs(formData);
  if (hrefState) return hrefState;

  const sectionKind = await getSectionByKey(kind);
  if (!sectionKind) {
    return { error: "유효하지 않은 섹션 종류입니다." };
  }
  if (sectionKind.requires_page && !sourcePageId) {
    return { error: "이 섹션 종류는 연결할 페이지를 선택해야 합니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("page_sections")
    .update({
      source_page_id: sectionKind.requires_page ? sourcePageId : null,
      title: title || null,
      subtitle: subtitle || null,
      layout: sectionKind.requires_page ? layout : "cards",
      sort_order: sortOrder,
      is_active: isActive,
      content,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  if (
    kind === "page_link" ||
    kind === "cta" ||
    kind === "youtube_gallery" ||
    kind === "news_room" ||
    kind === "image_gallery" ||
    kind === "client_reviews" ||
    kind === "contact" ||
    (kind === "hero" && String((content as { variant?: string }).variant ?? "") === "bio")
  ) {
    const itemsError = await syncItems(id, items);
    if (itemsError) return { error: itemsError };
  } else {
    await syncItems(id, []);
  }

  await revalidatePage(pageId);
  return { error: null };
}

/** 세션이 살아 있는지. 열어둔 채 한참 뒤 누르면 여기서 걸린다. */
async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ? supabase : null;
}

export async function toggleSection(
  id: string,
  pageId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const supabase = await requireUser();
  if (!supabase) return UNAUTHORIZED;

  const { error } = await supabase
    .from("page_sections")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error)
    return { ok: false, error: `변경에 실패했습니다: ${error.message}` };

  await revalidatePage(pageId);
  return { ok: true };
}

export async function deleteSection(
  id: string,
  pageId: string,
): Promise<ActionResult> {
  const supabase = await requireUser();
  if (!supabase) return UNAUTHORIZED;

  const { error } = await supabase.from("page_sections").delete().eq("id", id);
  if (error)
    return { ok: false, error: `삭제에 실패했습니다: ${error.message}` };

  await revalidatePage(pageId);
  return { ok: true };
}

/**
 * 블록을 한 칸 위/아래로. 같은 페이지의 블록을 순서대로 다시 번호 매긴 뒤 이웃과 바꾼다.
 * 그래서 sort_order 가 중복돼 있어도 한 번 누르면 정리된다.
 */
export async function moveSection(
  id: string,
  pageId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const supabase = await requireUser();
  if (!supabase) return UNAUTHORIZED;

  const { data, error } = await supabase
    .from("page_sections")
    .select("id, sort_order")
    .eq("page_id", pageId)
    .order("sort_order")
    .order("created_at");
  if (error)
    return { ok: false, error: `순서를 읽지 못했습니다: ${error.message}` };

  const ids = (data ?? []).map((row) => row.id);
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ids.length) return { ok: true };

  [ids[index], ids[target]] = [ids[target], ids[index]];

  const updates = ids.map((rowId, order) =>
    supabase
      .from("page_sections")
      .update({ sort_order: order })
      .eq("id", rowId),
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return {
      ok: false,
      error: `순서 변경에 실패했습니다: ${failed.error.message}`,
    };
  }

  await revalidatePage(pageId);
  return { ok: true };
}

export async function resolveAdminPageId(
  requestedId: string | undefined,
): Promise<string | null> {
  if (requestedId) return requestedId;

  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", HOME_PAGE_SLUG)
    .maybeSingle();

  return data?.id ?? null;
}
