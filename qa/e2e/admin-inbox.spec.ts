import { expect, test } from "./fixtures";

/**
 * 상담 접수함 — 읽기 전용. 한 건을 여는 것은 상태를 바꾸는 쓰기라 여기서는 하지 않는다.
 */
test.describe("상담 접수함", () => {
  test("상단 바에 업무 탭이 설정 알약과 구분선으로 나뉘어 있다", async ({ admin }) => {
    await admin.goto("/admin/sections");
    await expect(admin.locator(".a-topbar-divider")).toBeAttached();
    const work = admin.locator(".a-work");
    await expect(work).toHaveText(/상담 접수/);
    // 설정 알약 안에는 들어 있지 않다.
    expect(await admin.locator(".a-tabs .a-work").count()).toBe(0);
  });

  test("접수함이 열리고 목록 또는 빈 안내가 보인다", async ({ admin }) => {
    await admin.goto("/admin/consultations");
    await expect(admin.locator(".a-work[data-active]")).toBeVisible();
    await expect(admin.getByRole("heading", { name: "상담 접수" })).toBeVisible();
    // 상태 칩 넷(전체·새 문의·확인함·처리 완료). 숫자 합이 맞는다.
    const chips = admin.locator(".a-chipf");
    await expect(chips).toHaveCount(4);
    const nums = await chips.locator(".a-chipf-n").allInnerTexts();
    expect(Number(nums[0])).toBe(nums.slice(1).reduce((a, n) => a + Number(n), 0));
    const rows = admin.locator(".a-row-inbox");
    if ((await rows.count()) === 0) {
      await expect(admin.locator(".a-empty")).toBeVisible();
      return;
    }
    // 행마다 시각·이름·상태 배지
    const first = rows.first();
    await expect(first.locator(".a-row-ord")).not.toBeEmpty();
    await expect(first.locator(".a-row-name")).not.toBeEmpty();
    await expect(first.locator(".a-badge")).toHaveText(/새 문의|확인함|처리 완료/);
    // 상단 배지 수 = 목록의 "새 문의" 수
    const newRows = await admin.locator('.a-row-inbox[data-status="new"]').count();
    const badge = admin.locator(".a-work .a-newcount");
    if (newRows === 0) expect(await badge.count()).toBe(0);
    else await expect(badge).toHaveText(String(newRows));
  });

  test("검색은 치는 대로 주소(?q=)에 반영되고 상태 필터는 유지된다", async ({ admin }) => {
    await admin.goto("/admin/consultations?status=read");
    const box = admin.locator(".a-search input[name=q]");
    await expect(box).toBeVisible();
    // Enter 없이 입력만. 잠시 뒤 주소가 바뀐다.
    await box.fill("zz-없는-검색어-zz");
    await admin.waitForURL(/q=/);
    const url = new URL(admin.url());
    expect(url.searchParams.get("status")).toBe("read");
    expect(url.searchParams.get("q")).toBe("zz-없는-검색어-zz");
    await expect(admin.locator(".a-empty")).toContainText("맞는 문의가 없습니다");
    // 지우기는 상태 필터를 유지한 채 검색만 푼다
    await admin.locator(".a-search-clear").click();
    await admin.waitForURL((u) => !u.searchParams.has("q"));
    expect(new URL(admin.url()).searchParams.get("status")).toBe("read");
  });

});
