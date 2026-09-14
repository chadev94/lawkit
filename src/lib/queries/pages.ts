import { createClient } from "@/lib/supabase/server";
import { HOME_PAGE_SLUG, type SitePage } from "@/lib/sections";

/** admin용. 비활성 포함 전체 페이지. */
export async function getAllPages(): Promise<SitePage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("sort_order")
    .order("title");

  if (error) throw error;
  return (data ?? []) as SitePage[];
}

/** 공개 사이트 헤더용. 활성이면서 네비 노출로 표시된 페이지. RLS 가 비활성을 걸러준다. */
export async function getNavPages(): Promise<SitePage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("show_in_nav", true)
    .order("sort_order")
    .order("title");

  if (error) throw error;
  return (data ?? []) as SitePage[];
}

/** 공개/조회용. slug로 활성 페이지. */
export async function getActivePageBySlug(slug: string): Promise<SitePage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data as SitePage | null;
}

export async function getPageById(id: string): Promise<SitePage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as SitePage | null;
}

export async function getHomePage(): Promise<SitePage | null> {
  return getActivePageBySlug(HOME_PAGE_SLUG);
}
