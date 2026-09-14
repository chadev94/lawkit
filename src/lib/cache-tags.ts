/** Next.js unstable_cache / revalidateTag 용 태그 */
export const CACHE_TAGS = {
  siteSettings: "site-settings",
  pages: "pages",
  pageSections: "page-sections",
} as const;

/** 공개 사이트 ISR 주기(초). Vercel CDN 캐시 + stale-while-revalidate. */
export const PUBLIC_REVALIDATE_SECONDS = 300;
