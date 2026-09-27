import {
  CONSULTATION_STATUS_LABEL,
  labelAnswers,
} from "@/lib/consultation";
import {
  getConsultationFieldLabels,
  getConsultationRequest,
  getConsultationRequests,
} from "@/lib/queries/consultations";
import { openConsultation } from "./actions";
import { ConsultationDetail } from "./detail";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  new: "a-badge a-badge-warn",
  read: "a-badge a-badge-off",
  done: "a-badge a-badge-ok",
} as const;

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 첫 칸(보통 성함)과 그 다음 칸을 목록 한 줄로. */
function summary(
  answers: Record<string, string>,
  labels: Map<string, string>,
): { name: string; sub: string } {
  const rows = labelAnswers(answers, labels);
  return {
    name: rows[0]?.value ?? "(내용 없음)",
    sub: rows
      .slice(1, 3)
      .map((r) => r.value)
      .join(" · "),
  };
}

/**
 * 상담 접수함. 좌 목록 / 우 상세. 목록에서 한 건을 누르면 "확인함"이 되고 상세가 열린다.
 * 설정 탭과 달리 미리보기가 없다 — 사이트를 만지는 화면이 아니라 들어온 일을 보는 화면.
 */
export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const [requests, labels, selected] = await Promise.all([
    getConsultationRequests(),
    getConsultationFieldLabels(),
    id ? getConsultationRequest(id) : Promise.resolve(null),
  ]);
  const newCount = requests.filter((r) => r.status === "new").length;

  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-5 px-6 py-6">
      <div>
        <h1 className="a-title">상담 접수</h1>
        <p className="a-lead mt-1">
          사이트 상담 폼으로 들어온 문의입니다. 한 건을 누르면 확인한 것으로
          표시되고, 연락까지 마쳤으면 처리 완료로 바꿉니다.
        </p>
      </div>

      <div className="a-workbench">
        <div className="flex min-w-0 flex-col gap-3">
          <p className="a-label">
            전체 {requests.length}건
            {newCount > 0 && (
              <>
                {" "}
                · <span style={{ color: "var(--a-warn)" }}>새 문의 {newCount}건</span>
              </>
            )}
          </p>

          {requests.length === 0 ? (
            <p className="a-empty">
              아직 들어온 문의가 없습니다. 사이트의 상담 폼으로 접수되면 여기에
              쌓입니다.
            </p>
          ) : (
            <ul className="a-list">
              {requests.map((request) => {
                const { name, sub } = summary(request.answers, labels);
                const open = request.id === selected?.id;
                return (
                  <li key={request.id}>
                    <form
                      action={openConsultation}
                      className={`a-row a-row-inbox ${open ? "a-row-open" : ""}`}
                      data-status={request.status}
                    >
                      <input type="hidden" name="id" value={request.id} />
                      <span className="a-row-ord">{formatTime(request.created_at)}</span>
                      <button type="submit" className="a-row-main">
                        <span className="a-row-name">{name}</span>
                        <span className="a-row-sub">{sub || " "}</span>
                      </button>
                      <span className={STATUS_BADGE[request.status]}>
                        {CONSULTATION_STATUS_LABEL[request.status]}
                      </span>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="a-workbench-preview min-w-0">
          {selected ? (
            <ConsultationDetail
              request={selected}
              rows={labelAnswers(selected.answers, labels)}
            />
          ) : (
            <div className="a-card">
              <p className="a-hint px-6 py-24 text-center">
                왼쪽 목록에서 문의를 고르면 여기에 내용이 보입니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
