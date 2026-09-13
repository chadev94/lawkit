# lawkit

변호사 웹사이트. admin에서 등록한 콘텐츠가 공개 사이트에 반영된다.

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- **Supabase** — DB / Auth / Storage
- **Vercel** — 배포

요구사항: Node 22, pnpm 12, Docker

pnpm 버전은 `package.json` 의 `packageManager` 가 단일 출처다. 버전이 안 맞으면
실행이 거부되므로 `corepack enable` 을 한 번 해두면 자동으로 맞춰진다.

## Setup

```bash
git clone https://github.com/chadev94/lawkit.git
cd lawkit
pnpm install

cp .env.example .env.local
# Supabase 대시보드 > Project Settings > API Keys 에서 값 복사

supabase login
supabase link --project-ref ectpbcqluleitqrxoobx

supabase start       # 로컬 스택 기동 (Docker)
supabase db reset    # migrations + seed 적용

pnpm dev
```

`localhost:3000` 공개 사이트 / `localhost:3000/admin` 관리자

Supabase 접근 권한은 `chameleondev` org에서 초대받는다.

## Scripts

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | 타입 검사 |

## 구조

```
src/
├── app/
│   ├── (site)/            공개 사이트
│   └── (admin)/admin/     관리자
├── components/
│   ├── site/
│   ├── admin/
│   └── ui/                공통
└── lib/
    └── supabase/
        ├── client.ts      Client Component용
        └── server.ts      Server Component / Server Action용

supabase/
├── config.toml
├── migrations/            테이블 정의
└── seed.sql               카테고리 등 초기 데이터
```

`(site)` / `(admin)` 은 Route Group이라 URL에 나타나지 않는다. 레이아웃과 인증 정책 분리용.

## 브랜치

```
feature → main → production
```

| | `main` | `production` |
|---|---|---|
| 직접 push | 차단 | 차단 |
| PR | 필수 | 필수 |
| 승인 | 0명 | 1명 |
| CI | 필수 | 필수 |
| 배포 | — | 운영 |

`main` 승인이 0명인 이유: 시차 두고 작업할 때 승인 대기 마찰이 크다. PR은 강제해서 diff는 보게 만든다.

admin은 `Merge without waiting for requirements` 로 승인을 우회할 수 있다. 긴급용.

```bash
git checkout main && git pull
git checkout -b feat/무엇을-하는지
# 작업
git push -u origin feat/무엇을-하는지
gh pr create --base main
```

브랜치 이름: `feat/`, `fix/`, `chore/`

## 머지 방식

| 머지 | 방식 |
|---|---|
| feature → `main` | **Squash** |
| `main` → `production` | **Merge commit** |

`main → production` 을 squash 하면 새 커밋이 생겨 히스토리가 갈라진다. 다음 릴리스 PR부터 이미 반영된 변경이 다시 diff에 잡히거나 충돌한다. Rebase 머지는 비활성화.

## DB

**대시보드에서 테이블을 직접 만들지 않는다.** 마이그레이션 파일이 스키마의 단일 출처다.

```bash
supabase migration new create_something
# SQL 작성

supabase db reset    # 로컬에 재적용해 검증
supabase db push     # 검증 후 원격 반영
```

| 위치 | DB |
|---|---|
| feature 브랜치 | 로컬 |
| `main` | `yoo&partners-dev` |
| `production` | 운영 (오픈 시 생성) |

대시보드에서 실수로 수정했다면 `supabase db diff -f 이름` 으로 파일에 회수한다.

## 보안

이 리포는 **public** 이다.

| | |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `NEXT_PUBLIC_` 금지. RLS를 전부 우회한다 |
| `.env.local` | 커밋 금지 |
| 공개 테이블 | RLS 필수. anon key는 노출이 전제다 |
| `inquiries` | `anon` 은 INSERT만. 사건 내용이 들어오는 민감정보 |
| 해결사례 문서 이미지 | 사건관계인 정보 마스킹 확인 후 업로드 |

`NEXT_PUBLIC_` 값은 빌드 시점에 브라우저 번들에 박힌다. 나중에 지워도 배포된 번들에는 남는다.

키를 커밋했다면 revert로 부족하다. 히스토리에 남으므로 **대시보드에서 로테이션**한다.
