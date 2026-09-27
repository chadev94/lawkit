# QA

"어드민에서 컨트롤되는 것이 실제 화면에 반영되는가"를 기계가 확인한다. 두 층이다.

## 1. 렌더 매트릭스 — `pnpm qa:render` (CI 에서 돈다)

`qa/render/*.test.tsx`. 브라우저·DB 없이 사이트 컴포넌트를 문자열로 렌더한다.

- 표시 방식(카드 / 리스트 / 캐러셀 / 가로 밴드) × 연결 페이지(해결사례 / 업무분야 / 구성원) — 전부 다른 화면이 나와야 한다.
  페이지 이름으로 모양을 강제하면 여기서 잡힌다 (#39 가 그 사례)
- 스크롤 스토리(`content.variant=story`), 히어로 문구·버튼·`variant=bio`, 블록 순서·숨김·빈 목록

새 어드민 선택지를 만들면 여기에 케이스를 하나 추가한다. 데이터 모양은 `fixtures.ts`.

## 2. 어드민 미리보기 — `pnpm qa:admin` (로컬에서만)

`qa/e2e/*.spec.ts`. Playwright 로 로컬 어드민(`localhost:4000`)에 로그인해 편집 폼을 만지고 오른쪽 미리보기 DOM 을 본다.

- **저장하지 않는다.** 모든 POST/PUT/PATCH/DELETE 를 차단하고, 시도가 있었으면 검사가 실패한다
- 로그인은 한 번만(`auth.setup.ts`) → `qa/.auth/admin.json` 에 세션 저장(git 제외)
- 계정: `.env.local` 의 `ADMIN_TEST_EMAIL` / `ADMIN_TEST_PASSWORD`. 저장소에 올리지 않는다

처음 한 번: `pnpm exec playwright install chromium`

검사 항목: 표시 방식 4가지 전환, 제목 수정 즉시 반영·저장 전 배지, 미리보기 클릭 → 편집기 열림·칸 포커스, 미리보기 링크 이동 차단, 페이지 이름 → 상단 메뉴, 메뉴 표시 끄기 → 안내, 사무소 이름 → 머리말·꼬리말, 색 칸 포커스 표식.
