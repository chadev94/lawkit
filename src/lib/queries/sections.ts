import { createClient } from "@/lib/supabase/server";
import type { Section } from "@/lib/sections";

/** admin용. 비활성 종류까지 전부. */
export async function getAllSectionsCatalog(): Promise<Section[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as Section[];
}

/** 공개/등록 폼용. 활성 종류만. */
export async function getActiveSectionsCatalog(): Promise<Section[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as Section[];
}

export async function getSectionByKey(key: string): Promise<Section | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;
  return data as Section | null;
}
