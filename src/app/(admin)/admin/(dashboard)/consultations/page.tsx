import Link from "next/link";
import {
  CONSULTATION_STATUSES,
  CONSULTATION_STATUS_LABEL,
  isConsultationStatus,
  labelAnswers,
  normalizeSearch,
  type ConsultationStatus,
} from "@/lib/consultation";
import {
  CONSULTATION_PAGE_SIZE,
  countConsultationsByStatus,
  getConsultationFieldLabels,
  getConsultationRequest,
  getConsultationRequests,
} from "@/lib/queries/consultations";
import { openConsultation } from "./actions";
import { ConsultationDetail } from "./detail";
import { SearchBox } from "./search-box";

export const dynamic = "force-dynamic";

const PATH = "/admin/consultations";

const STATUS_BADGE: Record<ConsultationStatus, string> = {
  new: "a-badge a-badge-warn",
  read: "a-badge a-badge-off",
  done: "a-badge a-badge-ok",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

/** 목록 주소. 필터·페이지를 주소에 두어 새로고침·뒤로가기에도 남는다. */
function href(
  status: ConsultationStatus | null,
  page: number,
  q: string | null,
  id?: string,
) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  if (q) params.set("q", q);
  if (id) params.set("id", id);
  const qs = params.toString();
  return qs ? `${PATH}?${qs}` : PATH;
}

/** 첫 칸(보통 성함)과 그 다음 칸을 목록 한 줄로. */
function summary(answers: Record<string, string>, labels: Map<string, string>) {
  const rows = labelAnswers(answers, labels);
  return {
    name: rows[0]?.value ?? "(내용 없음)",
    sub: rows
      .slice(1, 3)
      .map((r) => r.value)
      .join(" · "),
  };
}

/** 번호 버튼에 보일 페이지들: 현재 ±2, 처음·끝. 그 사이는 … */
function pageNumbers(current: number, last: number): (number | "…")[] {
  const set = new Set<number>([1, last]);
  for (let p = current - 2; p <= current + 2; p++) if (p >= 1 && p <= last) set.add(p);
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

/**
 * 상담 접수함. 좌 목록 / 우 상세. 목록에서 한 건을 누르면 "확인함"이 되고 상세가 열린다.
 * 설정 탭과 달리 미리보기가 없다 — 사이트를 만지는 화면이 아니라 들어온 일을 보는 화면.
 */
export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; status?: string; page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status = isConsultationStatus(sp.status) ? sp.status : null;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const q = normalizeSearch(sp.q);

  const [{ rows, total }, counts, labels, selected] = await Promise.all([
    getConsultationRequests({ status, page, q }),
    countConsultationsByStatus(q),
    getConsultationFieldLabels(),
    sp.id ? getConsultationRequest(sp.id) : Promise.resolve(null),
  ]);
  const last = Math.max(1, Math.ceil(total / CONSULTATION_PAGE_SIZE));
  const first = total === 0 ? 0 : (page - 1) * CONSULTATION_PAGE_SIZE + 1;
  const end = Math.min(total, page * CONSULTATION_PAGE_SIZE);

  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-5 px-6 py-6">
      <div>
        <h1 className="a-title">상담 접수</h1>
        <p className="a-lead mt-1">
          사이트 상담 폼으로 들어온 문의입니다. 한 건을 누르면 확인한 것으로
          표시되고, 연락까지 마쳤으면 처리 완료로 바꿉니다.
        </p>
      </div>

      <div className="a-workbench a-workbench-inbox">
        <div className="min-w-0">
          <div className="a-col-head">
            <nav className="a-chipf-list" aria-label="상태로 거르기">
              <Link href={href(null, 1, q)} className="a-chipf" data-active={status === null || undefined}>
                전체 <span className="a-chipf-n">{counts.all}</span>
              </Link>
              {CONSULTATION_STATUSES.map((st) => (
                <Link
                  key={st}
                  href={href(st, 1, q)}
                  className="a-chipf"
                  data-active={status === st || undefined}
                >
                  <span className="a-chipf-dot" data-status={st} aria-hidden="true" />
                  {CONSULTATION_STATUS_LABEL[st]}
                  <span className="a-chipf-n">{counts[st]}</span>
                </Link>
              ))}
            </nav>

            <SearchBox initial={q ?? ""} />
          </div>

          {rows.length === 0 ? (
            <p className="a-empty">
              {q
                ? `"${q}" 에 맞는 문의가 없습니다.`
                : status
                  ? `${CONSULTATION_STATUS_LABEL[status]} 상태인 문의가 없습니다.`
                  : "아직 들어온 문의가 없습니다. 사이트의 상담 폼으로 접수되면 여기에 쌓입니다."}
            </p>
          ) : (
            <div className="a-list">
              <ul>
                {rows.map((request) => {
                  const { name, sub } = summary(request.answers, labels);
                  const open = request.id === selected?.id;
                  return (
                    <li key={request.id} className="a-list-item">
                      <form
                        action={openConsultation}
                        className={`a-row a-row-inbox ${open ? "a-row-open" : ""}`}
                        data-status={request.status}
                      >
                        <input type="hidden" name="id" value={request.id} />
                        <input type="hidden" name="status" value={status ?? ""} />
                        <input type="hidden" name="page" value={page} />
                        {q && <input type="hidden" name="q" value={q} />}
                        <span className="a-row-ord">{formatTime(request.created_at)}</span>
                        <button type="submit" className="a-row-main">
                          <span className="a-row-name">
                            {name}
                            {request.note && (
                              <span className="a-note-mark" title="메모 있음">
                                메모
                              </span>
                            )}
                          </span>
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

              <div className="a-pager">
                <span>
                  {first}–{end} / {total}건
                </span>
                {last > 1 && (
                  <nav className="a-pager-btns" aria-label="페이지">
                    <Link
                      href={href(status, page - 1, q)}
                      className="a-pbtn"
                      aria-disabled={page <= 1 || undefined}
                      aria-label="이전 페이지"
                    >
                      ‹
                    </Link>
                    {pageNumbers(page, last).map((p, i) =>
                      p === "…" ? (
                        <span key={`gap-${i}`} className="a-pbtn" aria-hidden="true">
                          …
                        </span>
                      ) : (
                        <Link
                          key={p}
                          href={href(status, p, q)}
                          className="a-pbtn"
                          data-active={p === page || undefined}
                          aria-current={p === page ? "page" : undefined}
                        >
                          {p}
                        </Link>
                      ),
                    )}
                    <Link
                      href={href(status, page + 1, q)}
                      className="a-pbtn"
                      aria-disabled={page >= last || undefined}
                      aria-label="다음 페이지"
                    >
                      ›
                    </Link>
                  </nav>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="a-workbench-preview min-w-0">
          <div className="a-col-head">
            {selected ? (
              <p className="a-label">
                접수 <b style={{ color: "var(--a-ink)" }}>{formatFull(selected.created_at)}</b>
                <span className="a-hint"> · 개인정보 동의 {formatFull(selected.consented_at)}</span>
              </p>
            ) : (
              <p className="a-label">상세</p>
            )}
          </div>
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
