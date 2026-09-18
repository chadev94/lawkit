import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
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

async function fetchSiteSettings(): Promise<SiteSettings> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", "default")
    .maybeSingle();

  if (error) throw error;
  if (!data) return FALLBACK;
  return normalizeSiteSettings(data);
}

const getSiteSettingsCached = unstable_cache(
  fetchSiteSettings,
  ["site-settings", "yoopartners-terracotta-v1"],
  {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.siteSettings],
  },
);

/** 공개/관리 공통. 요청 내 중복 호출은 React.cache, 요청 간은 unstable_cache. */
export const getSiteSettings = cache(getSiteSettingsCached);
