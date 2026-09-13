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
