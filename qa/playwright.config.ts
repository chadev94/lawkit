import { defineConfig } from "@playwright/test";

/**
 * 어드민 읽기 전용 QA.
 * - 로컬 dev 서버(4000)에 테스트 계정으로 로그인해 "어드민에서 바꾼 것이 미리보기에 반영되는가"를 본다.
 * - 저장은 하지 않는다. 검사마다 모든 쓰기 요청을 차단한다(qa/e2e/fixtures.ts).
 * - 로그인은 `setup` 프로젝트에서 한 번만 하고 세션을 파일로 남겨 재사용한다(qa/.auth, git 제외).
 * - 계정은 .env.local 의 ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  reporter: [["list"]],
  outputDir: "./test-results",
  use: {
    baseURL: process.env.QA_BASE_URL ?? "http://localhost:4000",
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "admin",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: { storageState: "qa/.auth/admin.json" },
    },
  ],
});
