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

## 브랜치 전략

| 브랜치 | 역할 | 배포 |
|---|---|---|
| `main` | 기본 브랜치. 모든 작업이 여기로 모인다 | — |
| `production` | 운영 | 운영 사이트 |

흐름은 한 방향이다.

```
fork의 feature 브랜치 → main → production
```

두 브랜치 모두 보호되어 있다. 직접 push 불가, PR + 리뷰 1명 승인 + CI 통과 필요.

## 작업 방법

작업자는 이 리포를 **fork** 해서 자기 리포에서 작업하고, upstream으로 PR을 보낸다.

```bash
# 최초 1회
gh repo fork chadev94/lawkit --clone
cd lawkit

# 작업할 때마다
git checkout main
git pull upstream main
git checkout -b feat/무엇을-하는지
# ... 작업 ...
git push origin feat/무엇을-하는지
gh pr create --repo chadev94/lawkit --base main
```

브랜치 이름: `feat/...`, `fix/...`, `chore/...`

## 머지 방식 — 중요

**브랜치에 따라 머지 방식이 다르다. 섞으면 히스토리가 깨진다.**

| 머지 | 방식 | 이유 |
|---|---|---|
| feature → `main` | **Squash** | 커밋이 하나로 정리된다 |
| `main` → `production` | **Merge commit** | 히스토리를 유지해야 한다 (아래 설명) |

`main → production` 을 squash 하면 안 된다. squash는 새 커밋을 만들기 때문에
production과 main의 히스토리가 갈라지고, 다음 PR부터 이미 머지한 변경이
다시 diff에 잡히거나 충돌한다. 릴리스 방향 머지는 반드시 merge commit.

Rebase 머지는 아예 비활성화해뒀다.

## 환경변수

`.env.example` 참고. 주의할 점 하나.

`SUPABASE_SERVICE_ROLE_KEY` 는 **서버에서만** 쓴다. `NEXT_PUBLIC_` 접두어를 붙이면
브라우저로 노출되고, 이 키는 RLS를 전부 우회하므로 DB 전체가 열린다.

## DB 변경

Supabase 대시보드에서 직접 수정하지 않는다. 마이그레이션 파일로 관리한다.
그렇지 않으면 다른 환경에서 같은 스키마를 재현할 수 없다.
