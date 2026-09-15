import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
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

async function fetchNavPages(): Promise<SitePage[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("show_in_nav", true)
    .eq("is_active", true)
    .order("sort_order")
    .order("title");

  if (error) throw error;
  return (data ?? []) as SitePage[];
}

const getNavPagesCached = unstable_cache(fetchNavPages, ["nav-pages"], {
  revalidate: PUBLIC_REVALIDATE_SECONDS,
  tags: [CACHE_TAGS.pages],
});

/** 공개 사이트 헤더용. 활성이면서 네비 노출로 표시된 페이지. */
export const getNavPages = cache(getNavPagesCached);

async function fetchActivePageBySlug(slug: string): Promise<SitePage | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data as SitePage | null;
}

/** 공개/조회용. slug로 활성 페이지. */
export async function getActivePageBySlug(
  slug: string,
): Promise<SitePage | null> {
  return unstable_cache(
    () => fetchActivePageBySlug(slug),
    ["active-page", slug],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.pages, `${CACHE_TAGS.pages}:${slug}`],
    },
  )();
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

export const getHomePage = cache(async () =>
  getActivePageBySlug(HOME_PAGE_SLUG),
);
