import { describe, expect, it } from "vitest";
import { labelAnswers } from "@/lib/consultation";

describe("접수함 · 답에 칸 이름 붙이기", () => {
  const labels = new Map([
    ["name", "성함"],
    ["tel", "연락처"],
    ["body", "상담 내용"],
  ]);

  it("항목 정의 순서로 정렬하고 이름을 붙인다", () => {
    const rows = labelAnswers({ body: "내용", name: "홍길동", tel: "010" }, labels);
    expect(rows.map((r) => `${r.label}=${r.value}`)).toEqual([
      "성함=홍길동",
      "연락처=010",
      "상담 내용=내용",
    ]);
  });

  it("삭제된 칸의 값은 버리지 않고 뒤에 '삭제된 칸'으로 둔다", () => {
    const rows = labelAnswers({ old: "옛 값", name: "홍길동" }, labels);
    expect(rows.at(-1)).toEqual({ key: "old", label: "삭제된 칸", value: "옛 값", orphan: true });
    expect(rows[0].key).toBe("name");
  });

  it("빈 값·문자열 아닌 값은 빼고 보여준다", () => {
    const rows = labelAnswers({ name: "", tel: 123 as unknown as string, body: "x" }, labels);
    expect(rows.map((r) => r.key)).toEqual(["body"]);
  });
});

describe("접수함 · 검색어 다루기", async () => {
  const { escapeLike, normalizeSearch } = await import("@/lib/consultation");

  it("% 와 _ 는 문자 그대로 찾는다 (전체를 뽑아 가지 못한다)", () => {
    expect(escapeLike("100%")).toBe("100\\%");
    expect(escapeLike("a_b")).toBe("a\\_b");
    expect(escapeLike("back\\slash")).toBe("back\\\\slash");
  });

  it("공백만 · 빈 값은 null, 앞뒤 공백 제거, 100자 상한", () => {
    expect(normalizeSearch("   ")).toBeNull();
    expect(normalizeSearch(undefined)).toBeNull();
    expect(normalizeSearch("  5555 ")).toBe("5555");
    expect(normalizeSearch("x".repeat(200))).toHaveLength(100);
  });
});
