<!--
제목: type: 무엇을 했는지   (feat / fix / refactor / chore / docs)
base 는 main. production 으로는 main 에서만 릴리스 PR 을 낸다.
머지 방식: feature → main 은 Squash, main → production 은 Merge commit.
-->

## Background

<!-- 왜 이 변경이 필요한가. 무엇이 문제였고 어떤 맥락인가. diff 는 무엇을 바꿨는지만 보여주고 이유는 여기에만 남는다. -->

## 변경

<!-- 무엇을 바꿨는지. 표나 목록. DB 변경이 있으면 마이그레이션 파일명과 함께 적는다. -->

## 확인

<!-- 실제로 돌려본 것에만 체크한다. -->

- [ ] `pnpm lint` / `pnpm typecheck` / `pnpm build` 통과
- [ ] 화면 변경: Preview URL 에서 확인
- [ ] DB 변경: 로컬 또는 dev 에서 마이그레이션 적용 확인 (`db push` 는 머지 후)

## 범위 밖

<!-- 이 PR 에서 의도적으로 하지 않은 것. 이어질 티켓이 있으면 링크. 비우지 않는다. -->

## 참고

<!-- Jira 티켓(YP-n), 관련 PR, 문서 링크 -->
