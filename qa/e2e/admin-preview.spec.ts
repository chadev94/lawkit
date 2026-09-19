import { expect, preview, test } from "./fixtures";

/**
 * "어드민에서 컨트롤되는 것이 미리보기(= 사이트와 같은 컴포넌트)에 반영되는가."
 * 저장하지 않는다. 편집 폼 값만 바꾸고 오른쪽 미리보기 DOM 을 본다.
 */

test.describe("화면 구성 · 블록 편집 → 미리보기", () => {
  test("표시 방식 4가지가 각각 다른 모양으로 그려진다", async ({ admin }) => {
    await admin.goto("/admin/sections");
    // 연결 페이지가 있는(page_link) 첫 블록을 연다
    const rows = admin.locator(".a-list > li");
    const count = await rows.count();
    let opened = false;
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      if (!(await row.locator(".a-chip", { hasText: "페이지 연결" }).count())) continue;
      await row.locator(".a-row-main").click();
      opened = true;
      break;
    }
    test.skip(!opened, "페이지 연결 블록이 없다");

    const layout = admin.locator('select[name="layout"]');
    await expect(layout).toBeVisible();
    const blockId = await admin.locator('input[name="id"]').inputValue();
    const block = preview(admin).locator(`[data-preview-section="${blockId}"]`);

    const marker: Record<string, string> = {
      cards: ".m-card",
      list: ".m-row",
      carousel: ".m-carousel-track",
      bands: ".m-bands",
    };
    const seen = new Set<string>();
    for (const value of Object.keys(marker)) {
      if (!(await layout.locator(`option[value="${value}"]`).count())) continue;
      await layout.selectOption(value);
      await expect(block.locator(marker[value]).first(), `${value} 표식`).toBeVisible();
      seen.add(await block.innerHTML());
    }
    expect(seen.size, "표시 방식마다 HTML 이 달라야 한다").toBeGreaterThan(1);
  });

  test("제목을 고치면 미리보기 제목이 즉시 바뀐다 (저장 전)", async ({ admin }) => {
    await admin.goto("/admin/sections");
    await admin.locator(".a-list > li .a-row-main").first().click();
    const title = admin.locator('input[name="title"]').first();
    const blockId = await admin.locator('input[name="id"]').inputValue();
    const block = preview(admin).locator(`[data-preview-section="${blockId}"]`);

    const probe = `QA-${Date.now()}`;
    await title.fill(probe);
    await expect(block.locator('[data-field="title"]')).toContainText(probe);
    await expect(admin.locator(".a-badge-warn", { hasText: "저장 전" })).toBeVisible();
  });

  test("미리보기 블록을 클릭하면 그 블록 편집기가 열리고 칸에 커서가 간다", async ({ admin }) => {
    await admin.goto("/admin/sections");
    const blocks = preview(admin).locator("[data-preview-section]");
    test.skip((await blocks.count()) < 2, "블록이 2개 미만");
    const second = blocks.nth(1);
    const id = await second.getAttribute("data-preview-section");
    await second.locator('[data-field="title"]').first().click();
    await expect(admin.locator(`input[name="id"][value="${id}"]`)).toBeAttached();
    await expect(admin.locator(":focus")).toHaveAttribute("data-focus-field", "title");
  });

  test("미리보기 안의 링크를 눌러도 사이트로 이동하지 않는다", async ({ admin }) => {
    await admin.goto("/admin/sections");
    const before = admin.url();
    const link = preview(admin).locator("a[href]").first();
    if (await link.count()) await link.click();
    await admin.waitForTimeout(400);
    expect(admin.url()).toBe(before);
  });
});

test.describe("페이지 · 메뉴 → 상단 메뉴 미리보기", () => {
  test("페이지 이름을 고치면 미리보기 상단 메뉴 글자가 바뀐다", async ({ admin }) => {
    await admin.goto("/admin/pages");
    const rows = admin.locator(".a-list > li");
    // 홈이 아닌 첫 페이지
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      if ((await row.locator(".a-row-sub").innerText()).trim() === "/") continue;
      await row.locator(".a-row-main").click();
      break;
    }
    const title = admin.locator('input[name="title"]').first();
    const probe = `메뉴QA${Date.now() % 1000}`;
    await title.fill(probe);
    await expect(preview(admin).locator("nav")).toContainText(probe);
  });

  test("메뉴에 표시를 끄면 상단 메뉴에서 사라지고 안내가 뜬다", async ({ admin }) => {
    await admin.goto("/admin/pages");
    const rows = admin.locator(".a-list > li");
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      if ((await row.locator(".a-row-sub").innerText()).trim() === "/") continue;
      await row.locator(".a-row-main").click();
      break;
    }
    const name = (await admin.locator('input[name="title"]').first().inputValue()).trim();
    const nav = preview(admin).locator("nav");
    await expect(nav).toContainText(name);
    const toggle = admin.locator('input[name="show_in_nav"]');
    if (await toggle.isChecked()) {
      await toggle.uncheck();
      await expect(nav).not.toContainText(name);
      await expect(admin.getByText("상단 메뉴에 나오지 않습니다")).toBeVisible();
    }
  });
});

test.describe("사이트 설정 → 전체 미리보기", () => {
  test("사무소 이름을 고치면 머리말·꼬리말이 바뀌고, 색 칸 포커스는 표식을 켠다", async ({ admin }) => {
    await admin.goto("/admin/settings");
    const probe = `유앤QA${Date.now() % 1000}`;
    await admin.fill('input[name="site_name"]', probe);
    const pv = preview(admin);
    await expect(pv.locator('[data-field="content.site_name"]').first()).toContainText(probe);
    await expect(pv.locator("footer")).toContainText(probe);
    await expect(admin.locator(".a-badge-warn", { hasText: "저장 전" })).toBeVisible();

    await admin.locator('input[name="color_primary"]').focus();
    await expect(admin.locator(".a-colorpick[data-active]")).toHaveCount(1);
  });
});

test.afterEach(async ({ blocked }) => {
  // 차단된 쓰기가 있다면 검사 코드가 저장을 시도한 것이다. 검사가 잘못된 것이니 알린다.
  expect(blocked, "쓰기 요청이 시도됨 — 이 검사는 읽기 전용이어야 한다").toEqual([]);
});
