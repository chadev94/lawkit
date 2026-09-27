import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactForm } from "@/components/site/contact-form";
import {
  fieldsFromSection,
  validateAnswers,
  type ConsultationField,
} from "@/lib/consultation";
import { item, section } from "./fixtures";

const field = (
  key: string,
  over: Partial<ConsultationField> = {},
): ConsultationField => ({
  key,
  label: key,
  hint: "",
  type: "text",
  required: false,
  options: [],
  ...over,
});

describe("상담 신청 · 칸 정의는 어드민 항목에서 온다", () => {
  const contact = section({
    kind: "contact",
    source_page: null,
    source_page_id: null,
    title: "상담 문의",
    section: { key: "contact", name: "상담 문의 폼", requires_page: false },
    items: [
      item(0, { title: "성함", meta: { field_key: "name", type: "text", required: true } }),
      item(1, { title: "이메일", meta: { field_key: "email", type: "email", required: true } }),
      item(2, { title: "분야", meta: { field_key: "area", type: "select", options: "형사|민사" } }),
      item(3, { title: "내용", meta: { field_key: "body", type: "textarea" } }),
      item(4, { title: "숨김", meta: { field_key: "off" }, is_active: false }),
    ],
  });

  it("항목 수만큼 input 이 생기고, 숨긴 항목은 빠진다", () => {
    const html = renderToStaticMarkup(<ContactForm section={contact} />);
    expect(html).toContain('name="answers.name"');
    expect(html).toContain('name="answers.email"');
    expect(html).toContain('name="answers.area"');
    expect(html).toContain('name="answers.body"');
    expect(html).not.toContain('name="answers.off"');
    expect(html).toContain("<option value=\"형사\"");
    expect(html).toContain("<textarea");
  });

  it("항목이 없으면 폼 대신 안내가 나온다", () => {
    const html = renderToStaticMarkup(
      <ContactForm section={{ ...contact, items: [] }} />,
    );
    expect(html).toContain("입력 칸이 아직 없습니다");
    expect(html).not.toContain('name="answers.');
  });

  it("field_key 가 없는 옛 항목은 id 를 열쇠로 쓴다", () => {
    const fields = fieldsFromSection({
      items: [item(0, { title: "성함", meta: {} })],
    });
    expect(fields[0].key).toBe("item-0");
  });
});

describe("상담 신청 · 서버 검사", () => {
  const fields = [
    field("name", { label: "성함", required: true }),
    field("email", { label: "이메일", type: "email" }),
    field("tel", { label: "연락처", type: "tel" }),
    field("area", { label: "분야", type: "select", options: ["형사", "민사"] }),
    field("body", { label: "내용", type: "textarea" }),
  ];

  it("필수 칸이 비면 그 칸 오류", () => {
    const r = validateAnswers(fields, { name: "  " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors)).toEqual(["name"]);
  });

  it("이메일·전화·선택지 형식을 본다", () => {
    const r = validateAnswers(fields, {
      name: "홍길동",
      email: "not-an-email",
      tel: "abc",
      area: "가사",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["area", "email", "tel"]);
  });

  it("정의에 없는 열쇠는 거부한다 (폼 우회)", () => {
    const r = validateAnswers(fields, { name: "홍길동", zzz: "<script>" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.zzz).toBeDefined();
  });

  it("글자 수 상한을 넘기면 거부한다", () => {
    const r = validateAnswers(fields, { name: "a".repeat(201) });
    expect(r.ok).toBe(false);
  });

  it("통과하면 다듬은 답만 남는다 (공백 정리, 빈 값 제외)", () => {
    const r = validateAnswers(fields, {
      name: " 홍길동 ",
      email: "hong@x.com",
      tel: "",
      area: "형사",
    });
    expect(r).toEqual({
      ok: true,
      answers: { name: "홍길동", email: "hong@x.com", area: "형사" },
    });
  });
});
