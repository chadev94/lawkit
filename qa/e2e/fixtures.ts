import { test as base, expect, type Page } from "@playwright/test";

/**
 * 쓰기 차단. 세션은 auth.setup 이 만든 storageState 로 이미 들어와 있다.
 * 모든 POST/PUT/PATCH/DELETE 를 막는다 — 서버 액션(저장·삭제·순서)은 전부 POST 라
 * 실수로 버튼을 눌러도 DB 에 닿지 않는다.
 */
export const test = base.extend<{ admin: Page; blocked: string[] }>({
  blocked: async ({}, provide) => {
    await provide([]);
  },
  admin: async ({ page, blocked }, provide) => {
    await page.route("**/*", (route) => {
      const req = route.request();
      const method = req.method();
      if (method === "GET" || method === "HEAD" || method === "OPTIONS") return route.continue();
      blocked.push(`${method} ${req.url()}`);
      return route.abort("blockedbyclient");
    });
    await provide(page);
  },
});

export { expect };

/** 어드민 미리보기 안(사이트 렌더) */
export const preview = (page: Page) => page.locator(".admin-preview");
