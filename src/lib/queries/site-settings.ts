import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_COLORS,
  DEFAULT_CONTENT,
  DEFAULT_TYPOGRAPHY,
  normalizeSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

const FALLBACK: SiteSettings = {
  id: "fallback",
  key: "default",
  colors: DEFAULT_COLORS,
  typography: DEFAULT_TYPOGRAPHY,
  content: DEFAULT_CONTENT,
};

/** 공개/관리 공통. 없으면 기본값. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", "default")
    .maybeSingle();

  if (error) throw error;
  if (!data) return FALLBACK;
  return normalizeSiteSettings(data);
}
