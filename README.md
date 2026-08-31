# lawkit

변호사 웹사이트. 변호사가 관리자 화면에서 콘텐츠를 등록·수정하면 공개 사이트에 반영되는 구조.

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — DB / 인증 / 스토리지
- **Vercel** — 배포

## 시작하기

```bash
pnpm install
cp .env.example .env.local   # 값 채우기
pnpm dev
```

Node 22, pnpm 10 기준.

## 스크립트

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | 타입 검사 |

## 디렉토리 구조

```
src/
├── app/
│   ├── (site)/            공개 사이트 — 방문자가 보는 화면
│   └── (admin)/admin/     관리자 — 변호사가 콘텐츠를 관리
├── components/
│   ├── site/              공개 사이트 전용
│   ├── admin/             관리자 전용
│   └── ui/                공통 (버튼, 입력 등)
└── lib/                   유틸, Supabase 클라이언트, 타입
```

`(site)` 와 `(admin)` 은 Next.js Route Group이라 URL에 나타나지 않는다.
공개 사이트와 관리자가 서로 다른 레이아웃·인증 정책을 갖도록 분리한 것.

## 작업 규칙

- `main` 에 직접 push 금지. 브랜치를 따서 PR로 올린다.
- PR은 리뷰 1명 승인 후 머지.
- CI(lint / typecheck / build)가 통과해야 머지 가능.
- 브랜치 이름: `feat/...`, `fix/...`, `chore/...`

## 환경변수

`.env.example` 참고. 주의할 점 하나.

`SUPABASE_SERVICE_ROLE_KEY` 는 **서버에서만** 쓴다. `NEXT_PUBLIC_` 접두어를 붙이면
브라우저로 노출되고, 이 키는 RLS를 전부 우회하므로 DB 전체가 열린다.

## DB 변경

Supabase 대시보드에서 직접 수정하지 않는다. 마이그레이션 파일로 관리한다.
그렇지 않으면 다른 환경에서 같은 스키마를 재현할 수 없다.
