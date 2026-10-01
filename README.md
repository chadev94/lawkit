# lawkit

변호사 웹사이트. admin에서 등록한 콘텐츠·테마가 공개 사이트에 반영된다.

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- **Supabase** — DB / Auth / Storage
- **Vercel** — 배포

요구사항: Node 22, pnpm 12, Docker

pnpm 버전은 `package.json` 의 `packageManager` 가 단일 출처다. 버전이 안 맞으면
실행이 거부되므로 `corepack enable` 을 한 번 해두면 자동으로 맞춰진다.

## 현재 기능

| 영역 | 경로 | 설명 |
|---|---|---|
| 공개 홈 | `/` | `pages.slug = home` 의 섹션 목록 렌더 |
| 공개 페이지 | `/[slug]` | `pages.slug` 에 대응하는 섹션 목록 렌더 |
| 관리자 로그인 | `/admin/login` | Supabase Auth 세션 |
| 상담 접수함 | `/admin/consultations` | 공개 사이트 문의 폼으로 들어온 상담 목록·상태·메모·검색 (`docs/consultation.md`) |
| 사이트 설정 | `/admin/settings` | 색상·폰트·브랜드/연락·사업자 정보·채널 링크 (`site_settings`) |
| 화면 구성 | `/admin/sections` | 페이지별 블록 편집 · 실시간 미리보기 · 드래그로 순서 변경 |
| 페이지 관리 | `/admin/pages` | 페이지 등록·경로·순서·메뉴 노출. 헤더 네비게이션은 `show_in_nav` 로 결정 |

블록 kind: `hero` / `page_link` / `cta` / `contact` / `youtube_gallery` / `news_room` / `image_gallery` / `client_reviews`

인증은 `src/proxy.ts` 에서 `/admin` 을 보호한다. 로그인 없이 대시보드에 접근하면 `/admin/login` 으로 보낸다.

공개 사이트 테마는 `site_settings` 를 CSS 변수로 주입한다. OS 다크모드와 무관하게 라이트 기준으로 고정하며, 색·폰트는 어드민에서 덮어쓴다.

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
supabase db reset    # migrations 적용 (리셋용 시드는 없다)

pnpm dev
```

- 공개 사이트: `http://localhost:3000`
- 관리자: `http://localhost:3000/admin` (로그인 필요)

Supabase 접근 권한은 `chameleondev` org에서 초대받는다.
관리자 계정은 Supabase Dashboard > Authentication > Users 에서 생성한다.

원격 DB만 쓰는 경우 `supabase db reset` 대신 대시보드 SQL Editor에서
`supabase/migrations/` 파일을 순서대로 실행해도 된다.

## Scripts

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | 타입 검사 |
| `pnpm check:migrations` | 마이그레이션 파일 규칙 검사 (CI 첫 단계) |
| `pnpm qa:render` | 사이트 컴포넌트 렌더 테스트 (Vitest, CI 포함) |
| `pnpm qa:admin` | 어드민 E2E (Playwright, 로컬 전용 — `qa/README.md`) |

## 구조

```
src/
├── app/
│   ├── (site)/                 공개 사이트 (/ , /[slug])
│   └── (admin)/admin/
│       ├── login/              로그인
│       └── (dashboard)/        상담 접수함·화면·페이지·설정 (인증 필요)
├── components/site/            블록 컴포넌트·헤더/푸터·모션
├── lib/
│   ├── actions/                공개 폼 서버 액션 (상담 접수)
│   ├── queries/                pages / sections / page-sections / site-settings / theme-presets / consultations
│   ├── section-content.ts      블록 kind별 content 파서
│   ├── section-media.ts        Storage 업로드
│   ├── site-settings.ts        테마·콘텐츠 스키마 / CSS 변수
│   └── supabase/
│       ├── client.ts           브라우저
│       ├── server.ts           서버 (쿠키 세션)
│       ├── public.ts           쿠키 없는 anon — 공개 페이지 ISR 용
│       ├── admin.ts            service role — 서버 전용
│       └── proxy.ts
└── proxy.ts                    Next.js 요청 가드 (admin auth)

qa/                             렌더 테스트(Vitest) + 어드민 E2E(Playwright)

supabase/
├── config.toml
├── migrations/                 스키마 단일 출처
└── seed_from_source_sites.sql  dev DB에 일회 적용한 콘텐츠 기록 (리셋 시드 아님)
```

`(site)` / `(admin)` / `(dashboard)` 는 Route Group이라 URL에 나타나지 않는다.

## 데이터 모델 (요약)

| 테이블 / 버킷 | 역할 |
|---|---|
| `pages` | 공개 페이지 (`slug`, home 예약). 헤더 네비는 `show_in_nav` |
| `sections` | 블록 kind 카탈로그 |
| `page_sections` | 페이지에 배치된 블록 + `content` jsonb |
| `page_section_items` | 목록형 블록의 아이템(+ `image_path`). contact 블록에선 폼 필드 정의 |
| `site_settings` | 싱글톤 전역 설정 (`colors` / `typography` / `content` jsonb) |
| `theme_presets` | 어드민용 테마 프리셋 (authenticated 만 읽기) |
| `consultation_requests` | 상담 접수. 쓰기는 서버 액션(service role)만 — `docs/consultation.md` |
| Storage `section-media` | 블록 이미지·영상. DB에는 path만 저장 |

이미지 path 예: `{page_section_id}/{uuid}.png`  
공개 URL: `{SUPABASE_URL}/storage/v1/object/public/section-media/{path}`

대시보드에서 확인: **Storage → `section-media`**, **Table Editor → `page_sections` / `page_section_items` / `site_settings`**.

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

`site_settings.content` 처럼 jsonb 필드만 앱에서 확장하는 경우 마이그레이션은 필수가 아니다.
행 구조·제약·RLS·버킷이 바뀌면 반드시 마이그레이션을 추가한다.

## 보안

이 리포는 **public** 이다.

| | |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `NEXT_PUBLIC_` 금지. RLS를 전부 우회한다. 상담 접수 서버 액션에서만 사용 |
| `.env.local` | 커밋 금지 |
| 공개 테이블 | RLS 필수. anon key는 노출이 전제다 |
| `site_settings` / 섹션 | `anon` 은 읽기, 쓰기는 `authenticated` |
| `section-media` | public read, 업로드는 `authenticated` |
| `consultation_requests` | `anon` 정책 없음(INSERT 포함). 쓰기는 서버 액션이 service role 로만. 사건 내용이 들어오는 민감정보 |
| 해결사례 문서 이미지 | 사건관계인 정보 마스킹 확인 후 업로드 |

`NEXT_PUBLIC_` 값은 빌드 시점에 브라우저 번들에 박힌다. 나중에 지워도 배포된 번들에는 남는다.

키를 커밋했다면 revert로 부족하다. 히스토리에 남으므로 **대시보드에서 로테이션**한다.
