import type { PageSection, PageSectionItem } from "@/lib/sections";

/**
 * 상담 신청 폼의 칸 정의와 답 검사.
 *
 * 칸은 코드에 없다. 상담(contact) 블록의 page_section_items 가 칸이다.
 *   title    → 칸 이름 (성함)
 *   subtitle → 안내 문구
 *   meta     → { field_key, type, required, options }
 *
 * 답은 { field_key: 값 } 봉투 하나로 오간다. 열쇠가 항목 id 가 아닌 이유:
 * 어드민이 블록을 저장하면 항목을 지우고 다시 넣어 id 가 매번 바뀐다.
 * field_key 는 항목을 처음 만들 때 한 번 정해지고 meta 에 남아 저장을 거쳐도 그대로다.
 *
 * 이 파일은 브라우저·서버·테스트 어디서나 돈다. DB 나 Next 에 의존하지 않는다.
 */

export const CONSULTATION_FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "tel",
  "select",
] as const;

export type ConsultationFieldType = (typeof CONSULTATION_FIELD_TYPES)[number];

export const CONSULTATION_FIELD_TYPE_LABEL: Record<ConsultationFieldType, string> = {
  text: "한 줄 글",
  textarea: "여러 줄 글",
  email: "이메일",
  tel: "전화번호",
  select: "선택지",
};

export type ConsultationField = {
  key: string;
  label: string;
  hint: string;
  type: ConsultationFieldType;
  required: boolean;
  /** type=select 일 때 고를 수 있는 값 */
  options: string[];
};

/** 글자 수 상한. 도배·용량 공격을 막는 선. */
export const CONSULTATION_MAX_LENGTH: Record<ConsultationFieldType, number> = {
  text: 200,
  email: 200,
  tel: 40,
  select: 200,
  textarea: 5000,
};

/** 봇이 채우는 숨은 칸 이름. 사람 눈에는 보이지 않는다. */
export const CONSULTATION_HONEYPOT = "website";

function isFieldType(value: unknown): value is ConsultationFieldType {
  return (
    typeof value === "string" &&
    (CONSULTATION_FIELD_TYPES as readonly string[]).includes(value)
  );
}

/** 항목 → 칸 정의. field_key 가 없는 옛 항목은 id 로 대신한다. */
export function fieldFromItem(
  item: Pick<PageSectionItem, "title" | "subtitle" | "meta"> & { id?: string },
): ConsultationField {
  const meta = item.meta ?? {};
  const key =
    typeof meta.field_key === "string" && meta.field_key
      ? meta.field_key
      : (item.id ?? "");
  const type = isFieldType(meta.type) ? meta.type : "text";
  const options = Array.isArray(meta.options)
    ? meta.options.filter((o): o is string => typeof o === "string" && o.trim() !== "")
    : typeof meta.options === "string"
      ? meta.options
          .split("|")
          .map((o) => o.trim())
          .filter(Boolean)
      : [];
  return {
    key,
    label: item.title?.trim() || "항목",
    hint: item.subtitle?.trim() ?? "",
    type,
    required: meta.required === true || meta.required === "true",
    options,
  };
}

/** 블록의 활성 항목만 칸으로 쓴다. 순서는 sort_order. */
export function fieldsFromSection(
  section: Pick<PageSection, "items">,
): ConsultationField[] {
  return [...section.items]
    .filter((item) => item.is_active !== false)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(fieldFromItem)
    .filter((field) => field.key !== "");
}

export type ValidationResult =
  | { ok: true; answers: Record<string, string> }
  | { ok: false; errors: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL = /^[0-9+\-\s().]{7,40}$/;

/**
 * 답을 칸 정의로 검사한다. 통과하면 정리된 답(문자열, 빈 값 제외)을 돌려준다.
 * 정의에 없는 열쇠는 오류다 — 누가 폼을 우회해 임의의 값을 밀어 넣는 경우.
 */
export function validateAnswers(
  fields: ConsultationField[],
  raw: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {};
  const answers: Record<string, string> = {};
  const known = new Set(fields.map((f) => f.key));

  for (const key of Object.keys(raw)) {
    if (!known.has(key)) errors[key] = "알 수 없는 항목입니다.";
  }

  for (const field of fields) {
    const value = typeof raw[field.key] === "string" ? (raw[field.key] as string).trim() : "";

    if (value === "") {
      if (field.required) errors[field.key] = `${field.label}을(를) 입력해 주세요.`;
      continue;
    }
    if (value.length > CONSULTATION_MAX_LENGTH[field.type]) {
      errors[field.key] = `${field.label}은(는) ${CONSULTATION_MAX_LENGTH[field.type]}자까지 쓸 수 있습니다.`;
      continue;
    }
    if (field.type === "email" && !EMAIL.test(value)) {
      errors[field.key] = "이메일 형식이 아닙니다.";
      continue;
    }
    if (field.type === "tel" && !TEL.test(value)) {
      errors[field.key] = "전화번호 형식이 아닙니다.";
      continue;
    }
    if (field.type === "select" && !field.options.includes(value)) {
      errors[field.key] = "목록에 있는 값 중에서 골라 주세요.";
      continue;
    }
    answers[field.key] = value;
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, answers };
}

/** 서버 액션 submitConsultation 의 상태. 폼(클라이언트)과 액션(서버)이 같이 쓴다. */
export type ConsultationState = {
  status: "idle" | "ok" | "error";
  /** 폼 위에 보여줄 한 줄. 성공 문구는 블록 content 에서 읽어 클라이언트가 보인다 */
  message: string | null;
  /** 칸별 오류. 열쇠는 field_key */
  errors: Record<string, string>;
};

export const CONSULTATION_IDLE: ConsultationState = {
  status: "idle",
  message: null,
  errors: {},
};
