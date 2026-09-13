import { createClient } from "@/lib/supabase/server";
import type { HomeSection } from "@/lib/sections";

const SELECT = "*, menu:menus(id, name, slug)";

/** 공개 사이트용. RLS에 의해 is_active 인 것만 내려온다. */
export async function getActiveSections(): Promise<HomeSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_sections")
    .select(SELECT)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as unknown as HomeSection[];
}

/** admin용. 비활성 섹션까지 전부 가져온다. */
export async function getAllSections(): Promise<HomeSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_sections")
    .select(SELECT)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as unknown as HomeSection[];
}
