import { createClient } from "@/lib/supabase/server";
import type { PageSection, PageSectionItem } from "@/lib/sections";

const SELECT = `
  *,
  menu:menus(id, name, slug),
  section:sections!kind(key, name, requires_menu),
  items:page_section_items(*)
`;

function normalizeSection(row: unknown): PageSection {
  const r = row as PageSection & { items?: PageSectionItem[] | null };
  const items = Array.isArray(r.items) ? [...r.items] : [];
  items.sort((a, b) => a.sort_order - b.sort_order);
  return {
    ...r,
    content:
      r.content && typeof r.content === "object" && !Array.isArray(r.content)
        ? (r.content as Record<string, unknown>)
        : {},
    items,
  };
}

/** 공개 사이트용. 특정 페이지의 활성 섹션 (+ 활성 아이템). */
export async function getActivePageSections(
  pageId: string,
): Promise<PageSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select(SELECT)
    .eq("page_id", pageId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;

  return (data ?? []).map((row) => {
    const section = normalizeSection(row);
    section.items = section.items.filter((item) => item.is_active);
    return section;
  });
}

/** admin용. 특정 페이지의 섹션 전부. */
export async function getPageSections(pageId: string): Promise<PageSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select(SELECT)
    .eq("page_id", pageId)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []).map(normalizeSection);
}
