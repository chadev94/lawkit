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
