/**
 * 상담 퍼널 진입 구간. 메인 페이지 4번째 섹션. (YP-9)
 *
 * 요구사항: 진행바가 있는 4단계, 선지 클릭만, 마지막에 연락처 수집.
 * 질문 내용은 변호사 주력 분야가 확정되어야 정할 수 있어 아직 미정이다.
 */
export function ConsultationCta() {
  return (
    <section className="bg-zinc-50 py-20">
      <div className="mx-auto max-w-xl px-6 text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-400">
          YOUR SITUATION
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-900">
          내 상황, 1분이면 확인됩니다
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          간단한 질문 4개에 답하면 맞춤 안내를 받으실 수 있습니다.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 text-left">
          {/* 진행바 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">4단계 중 1번째</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-zinc-100">
            <div className="h-1 w-1/4 rounded-full bg-zinc-900" />
          </div>

          <p className="mt-6 text-sm font-medium text-zinc-900">질문 영역</p>

          <div className="mt-4 space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-300"
              >
                선택지
                <span className="h-4 w-4 rounded-full border border-zinc-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
