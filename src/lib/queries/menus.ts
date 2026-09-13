import { createClient } from "@/lib/supabase/server";

export type Menu = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** 공개 사이트용. RLS에 의해 is_active 인 것만 내려온다. */
export async function getActiveMenus(): Promise<Menu[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

/** admin용. 비활성 메뉴까지 전부 가져온다. */
export async function getAllMenus(): Promise<Menu[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

/** 공개 사이트용. slug로 활성 메뉴 한 건을 찾는다. 없으면 null. */
export async function getActiveMenuBySlug(slug: string): Promise<Menu | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}
