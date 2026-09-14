"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase/server";
import { getSectionByKey } from "@/lib/queries/sections";
import { getPageById } from "@/lib/queries/pages";
import { HOME_PAGE_SLUG, pagePath } from "@/lib/sections";
import {
  contentFromFormData,
  itemsFromFormData,
  type SectionItemInput,
} from "@/lib/section-content";

export type ActionState = { error: string | null };

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

  if (kind === "page_link" || kind === "cta") {
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

  if (kind === "page_link" || kind === "cta") {
    const itemsError = await syncItems(id, items);
    if (itemsError) return { error: itemsError };
  } else {
    await syncItems(id, []);
  }

  await revalidatePage(pageId);
  return { error: null };
}

export async function toggleSection(
  id: string,
  pageId: string,
  isActive: boolean,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("page_sections")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw error;

  await revalidatePage(pageId);
}

export async function deleteSection(id: string, pageId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("page_sections").delete().eq("id", id);

  if (error) throw error;

  await revalidatePage(pageId);
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
