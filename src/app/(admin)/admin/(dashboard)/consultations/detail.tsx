"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CONSULTATION_STATUS_LABEL,
  type ConsultationStatus,
} from "@/lib/consultation";
import type { ConsultationRequest } from "@/lib/queries/consultations";
import { runAction } from "@/app/(admin)/admin/run-action";
import { setConsultationStatus } from "./actions";

function formatFull(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
        <div>
          <p className="a-label">접수 {formatFull(request.created_at)}</p>
          <p className="a-hint">개인정보 동의 {formatFull(request.consented_at)}</p>
        </div>
        <div className="flex gap-2">
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
              className="a-btn a-btn-quiet a-btn-sm"
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
    </div>
  );
}
