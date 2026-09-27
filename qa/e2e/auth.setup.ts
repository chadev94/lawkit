import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/** 로그인 한 번 → 세션을 qa/.auth/admin.json 에 저장. 나머지 검사가 재사용한다. */
setup("어드민 로그인", async ({ page, baseURL }) => {
  const env = readEnvLocal();
  const email = process.env.ADMIN_TEST_EMAIL ?? env.ADMIN_TEST_EMAIL;
  const password = process.env.ADMIN_TEST_PASSWORD ?? env.ADMIN_TEST_PASSWORD;
  setup.skip(!email || !password, "ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD 가 없다 (.env.local)");

  await page.goto("/admin/login");
  await page.fill('input[name="email"]', email!);
  await page.fill('input[name="password"]', password!);
  await page.click('button[type="submit"]');
  // /admin/login 자체도 /admin 으로 시작하므로 "login 이 아닌 admin 경로"를 기다린다
  await page.waitForURL((url) => url.pathname.startsWith("/admin") && !url.pathname.startsWith("/admin/login"));
  await expect(page.locator(".a-topbar")).toBeVisible();

  fs.mkdirSync(path.resolve("qa/.auth"), { recursive: true });
  await page.context().storageState({ path: "qa/.auth/admin.json" });
  void baseURL;
});

function readEnvLocal(): Record<string, string> {
  const file = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );
}
