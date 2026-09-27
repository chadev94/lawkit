"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CONSULTATION_STATUS_LABEL,
  type ConsultationStatus,
} from "@/lib/consultation";
import type { ConsultationRequest } from "@/lib/queries/consultations";
import { runAction } from "@/app/(admin)/admin/run-action";
import { saveConsultationNote, setConsultationStatus } from "./actions";

const STATUS_BADGE: Record<ConsultationStatus, string> = {
  new: "a-badge a-badge-warn",
  read: "a-badge a-badge-off",
  done: "a-badge a-badge-ok",
};

/** 전화·이메일처럼 보이는 값은 바로 누를 수 있게. */
function valueNode(value: string) {
  if (/^[0-9+\-\s().]{7,40}$/.test(value)) {
    return <a href={`tel:${value.replace(/[^0-9+]/g, "")}`}>{value}</a>;
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return <a href={`mailto:${value}`}>{value}</a>;
  }
  return <span className="whitespace-pre-wrap">{value}</span>;
}

/**
 * 상세 카드. 접수 시각은 왼쪽 열의 머리 줄과 높이를 맞추려고 바깥(page)에서 그린다.
 * 채운 색 버튼은 기본 동작(처리 완료) 하나. 나머지는 테두리 버튼이라 눌리는 것으로 보인다.
 */
export function ConsultationDetail({
  request,
  rows,
}: {
  request: ConsultationRequest;
  rows: { key: string; label: string; value: string; orphan: boolean }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function change(status: ConsultationStatus) {
    start(async () => {
      const ok = await runAction(
        () => setConsultationStatus(request.id, status),
        { message: `${CONSULTATION_STATUS_LABEL[status]}(으)로 표시했습니다` },
      );
      if (ok) router.refresh();
    });
  }

  return (
    <div className="a-card flex flex-col">
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        style={{ borderBottom: "1px solid var(--a-line)" }}
      >
        <p className="a-label flex items-center gap-2">
          상태
          <span className={STATUS_BADGE[request.status]}>
            {CONSULTATION_STATUS_LABEL[request.status]}
          </span>
        </p>
        <div className="flex gap-1.5">
          {request.status !== "done" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => change("done")}
              className="a-btn a-btn-primary a-btn-sm"
            >
              처리 완료
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => change("read")}
              className="a-btn a-btn-default a-btn-sm"
            >
              완료 취소
            </button>
          )}
          {request.status === "read" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => change("new")}
              className="a-btn a-btn-default a-btn-sm"
              title="아직 안 본 것으로 되돌립니다"
            >
              안 읽음으로
            </button>
          )}
        </div>
      </div>

      <dl className="a-inbox-dl">
        {rows.map((row) => (
          <div key={row.key} className="a-inbox-dl-row">
            <dt className={row.orphan ? "a-inbox-orphan" : undefined}>{row.label}</dt>
            <dd>{valueNode(row.value)}</dd>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="a-hint px-4 py-6">내용이 없는 접수입니다.</p>
        )}
      </dl>

      <NoteEditor
        key={request.id}
        id={request.id}
        note={request.note}
        updatedAt={request.note_updated_at}
      />
    </div>
  );
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 변호사 메모. 방문자가 쓴 내용과 분리된 처리 노트. 건당 하나를 제자리에서 고친다.
 * "9/25 통화함" 처럼 날짜를 앞에 붙여 이어 쓰면 이력이 된다.
 * key={request.id} 로 건이 바뀌면 입력값이 새로 잡힌다.
 */
function NoteEditor({
  id,
  note,
  updatedAt,
}: {
  id: string;
  note: string | null;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(note ?? "");
  const [pending, start] = useTransition();
  const dirty = value.trim() !== (note ?? "").trim();

  function save() {
    start(async () => {
      const ok = await runAction(() => saveConsultationNote(id, value), {
        message: value.trim() ? "메모를 저장했습니다" : "메모를 지웠습니다",
      });
      if (ok) router.refresh();
    });
  }

  return (
    <div className="a-note">
      <p className="a-note-label">메모</p>
      <div className="flex min-w-0 flex-col gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && dirty) save();
          }}
          rows={4}
          maxLength={5000}
          placeholder="예: 9/25 통화. 경찰 조사 10/2 동석하기로. 수임 여부는 조사 후 결정"
          className="a-textarea"
          aria-label="메모"
        />
        <div className="flex min-h-6 items-center justify-between gap-3">
          <span className="a-hint">
            {dirty
              ? "⌘/Ctrl + Enter 로 저장"
              : updatedAt
                ? `${formatFull(updatedAt)} 저장`
                : "이 문의에 대해 한 일과 답한 내용을 남겨 둡니다"}
          </span>
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="a-btn a-btn-default a-btn-sm"
          >
            {pending ? "저장 중..." : "메모 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
