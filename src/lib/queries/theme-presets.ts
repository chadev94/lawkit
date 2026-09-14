import { createClient } from "@/lib/supabase/server";
import {
  normalizeThemePreset,
  type ThemePreset,
} from "@/lib/theme-presets";

/** 관리자 화면용. 테이블이 없거나 조회에 실패하면 빈 목록. */
export async function getThemePresets(): Promise<ThemePreset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("theme_presets")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map(normalizeThemePreset);
}
