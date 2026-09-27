# 상담 접수

사이트 방문자가 상담 폼으로 보낸 문의를 저장하고, 변호사가 어드민에서 보고 처리하는 모듈.
코드는 "어떻게"만 말한다. 이 문서는 "왜 이렇게 했는지"와 "바꿀 때 지킬 것"을 적는다.

## 한눈에

```
방문자 브라우저 ──폼(내용만)──→ Next.js 서버 액션 submitConsultation
                                  ├─ 지금 DB 의 칸 정의로 검사
                                  └─ 비밀 키(service role)로 insert ──→ consultation_requests
어드민 ──쿠키 세션──→ /admin/consultations (RLS: 관리자 select · update)
```

| 무엇 | 어디 |
| --- | --- |
| 칸 정의 · 검사 · 상태 상수 | `src/lib/consultation.ts` |
| 서버 액션(접수) | `src/lib/actions/consultation.ts` |
| 공개 폼 · 완료 대화창 | `src/components/site/contact-form.tsx` |
| 어드민 조회 | `src/lib/queries/consultations.ts` |
| 어드민 접수함 | `src/app/(admin)/admin/(dashboard)/consultations/` |
| 테이블 · RLS | `supabase/migrations/20260924045821_create_consultation_requests.sql` |

## 정책

### 1. 칸은 코드에 없다

상담 블록(`page_sections.kind = contact`)의 항목(`page_section_items`)이 곧 입력 칸이다.

| 항목 컬럼 | 뜻 |
| --- | --- |
| `title` | 칸 이름 (성함) |
| `subtitle` | 안내 문구 |
| `meta.field_key` | 답과 칸을 잇는 **고정 열쇠** |
| `meta.type` | `text · textarea · email · tel · select` |
| `meta.required` | 필수 여부 |
| `meta.options` | select 의 선택지. `\|` 로 구분 |
| `is_active` | 끄면 폼에서 사라진다. 옛 접수의 이름 찾기용으로 행은 남는다 |

관리자가 어드민에서 칸을 추가·삭제·필수 지정하면 폼과 서버 검사가 그대로 따라간다.
**새 칸이 필요하다고 코드에 `name`, `email` 같은 필드를 박지 않는다.**

### 2. 답은 봉투 하나

`consultation_requests.answers` 는 jsonb `{ "<field_key>": "값" }`. 칸이 늘어도 테이블과 API 는 바뀌지 않는다.

열쇠가 항목 `id` 가 아니라 `meta.field_key` 인 이유: 어드민 저장은 항목을 전부 지우고 다시 넣어 `id` 가 매번 바뀐다.
`field_key` 는 항목을 처음 만들 때 한 번 정해지고 `meta` 에 남아 저장을 거쳐도 그대로다.
(`field_key` 가 없는 옛 항목은 저장 때 채워 넣고, 그 전까지는 `id` 로 대신한다.)

접수함은 답의 열쇠로 지금 항목 목록에서 이름을 찾는다. 항목이 삭제됐으면 "삭제된 칸"으로 값만 보인다. **값은 버리지 않는다.**

### 3. 넣는 문은 서버 하나

| 자격 | insert | select | update | delete |
| --- | --- | --- | --- | --- |
| 익명(공개 키) | ✗ | ✗ | ✗ | ✗ |
| 로그인 관리자 | ✗ | ✓ | ✓ | ✗ |
| 서버(비밀 키) | RLS 무시. 서버 액션만 갖는다 | | | |

- 익명 insert 를 열지 않는 이유: 공개 키는 브라우저에 보이므로, 열어 두면 서버 검사를 건너뛰고 직접 넣을 수 있다.
- **삭제 정책이 없는 것은 의도다.** 상담 기록은 아무도 지우지 못한다. 지워야 하면 Supabase 대시보드에서 사람이 직접 한다. 보관 기간 정책(아래 6)이 정해지면 그때 자동 삭제를 붙인다.
- 비밀 키는 `SUPABASE_SERVICE_ROLE_KEY`. 서버 환경변수에만 둔다. `NEXT_PUBLIC_` 을 붙이는 순간 DB 전체가 열린다. 키가 없으면 접수는 "지금은 접수할 수 없습니다"로 실패하고 서버 로그에 원인이 남는다.

### 4. 검사는 서버가, 지금 DB 의 정의로

브라우저의 `required` · `pattern` 은 빨리 알려주는 편의다. 서버 액션이 요청마다 그 블록의 항목을 다시 읽어 검사한다.

| 검사 | 결과 |
| --- | --- |
| 필수 칸 비움 | 그 칸 오류 |
| 이메일 · 전화 · 선택지 형식 | 그 칸 오류. 전화 규칙은 `CONSULTATION_TEL_PATTERN` 하나를 브라우저와 서버가 같이 쓴다 |
| 정의에 없는 열쇠 | 거부 (폼 우회) |
| 글자 수 상한 | `CONSULTATION_MAX_LENGTH` |
| 동의 체크 없음 | 거부 |
| 봇 칸(`website`) 채워짐 | 조용히 성공한 척, 저장 안 함 |
| 같은 IP 분당 5회 초과 | 거부. 서버 인스턴스 메모리라 완벽하진 않다 |

서버 액션은 함수 호출(RPC)이라 검사 실패도 HTTP 200 에 실려 온다. 400 을 주려면 라우트 핸들러가 필요한데, 호출자가 우리 폼 하나뿐이라 만들지 않았다. 외부(앱·타 서비스)가 접수를 밀어넣어야 하는 날 `src/app/api/` 에 열고 같은 `validateAnswers` 를 쓴다.

### 5. 상태는 셋

`new → read → done`. DB check 제약과 `CONSULTATION_STATUSES` 가 같은 값.

- 들어오면 `new`. 상단 바 배지는 `new` 건수.
- 목록에서 한 건을 **누르면**(POST) `read`. 읽기(GET)에서 상태를 바꾸지 않는다.
- 연락까지 끝내면 `done`. 되돌리기(완료 취소 · 안 읽음으로)도 된다.

### 6. 개인정보

상담 내용은 개인정보다.

- 서버 로그에 답 값을 찍지 않는다. 오류 로그는 원인만.
- IP · User-Agent 를 저장하지 않는다. 봇 방지는 메모리에서만 센다.
- 동의 시각(`consented_at`)을 같이 저장한다.
- **보관 기간은 아직 정하지 않았다.** 개인정보처리방침에 적는 기간과 맞춰 자동 삭제를 넣어야 한다. 그 전까지 삭제는 수동.

### 7. 접수 완료는 그 자리에서

화면 이동 없이 가운데 작은 대화창. 제목 · 안내 한 줄 · 전화 버튼은 어드민 상담 블록의 칸(`success_message` · `success_detail` · `success_phone`).
어드민에서 그 칸에 커서를 두면 미리보기에 대화창이 뜬다(`previewField` → `previewSuccess`). 공개 사이트는 이 값을 넘기지 않는다.

## 바꿀 때 지킬 것

- 항목(`page_section_items`)을 쓰는 블록 종류는 `KINDS_WITH_ITEMS`(`src/lib/section-content.ts`) 한 곳에만 등록한다. 빠지면 저장 때 항목이 지워진다. (실제로 한 번 났던 버그)
- 칸 종류를 추가하면 `CONSULTATION_FIELD_TYPES` · `CONSULTATION_MAX_LENGTH` · `validateAnswers` · 폼 렌더 · 어드민 편집기를 함께 고치고, `qa/render/consultation.test.tsx` 에 케이스를 더한다.
- 상태를 추가하면 마이그레이션(check 제약) + `CONSULTATION_STATUSES` + 배지 색을 함께 바꾼다.
- 상담 관련 서버 액션은 `src/lib/actions/` 에 둔다. `components` 는 `app` 을 import 할 수 없다.
- 컬럼을 추가할 때 개인정보면 이 문서 6번에 적는다.

## 아직 없는 것

메일 알림 · 건별 메모 · 검색 · 보관 기간에 따른 자동 삭제 · 스팸 표시 · 신청자 자동 답장. 필요해지는 순서대로 붙인다.
