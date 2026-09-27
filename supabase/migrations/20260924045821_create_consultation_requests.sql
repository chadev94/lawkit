-- 상담 신청 접수.
--
-- 칸(성함·이메일…)은 코드에 고정하지 않는다. 상담 블록의 page_section_items 가 칸 정의이고,
-- 답은 answers jsonb 에 {"<item id>": "값"} 으로 통째로 담는다.
-- 관리자가 칸을 늘려도 이 테이블과 API 는 바뀌지 않는다.
--
-- 접근: 익명(공개 키)은 어떤 동작도 못 한다. 신청은 서버 액션이 비밀 키로 검사 후 넣는다.
-- 관리자는 읽기와 상태 변경만. 상담 기록은 아무도 지우지 못한다.

create table consultation_requests (
  id               uuid primary key default gen_random_uuid(),
  -- 어느 폼 블록에서 왔나. 블록을 지워도 접수는 남긴다.
  page_section_id  uuid references page_sections (id) on delete set null,
  answers          jsonb not null default '{}'::jsonb,
  consented_at     timestamptz not null,
  status           text not null default 'new'
                   check (status in ('new', 'read', 'done')),
  created_at       timestamptz not null default now()
);

comment on table consultation_requests is
  '상담 신청 접수. answers 는 {page_section_items.id: 값}. 칸 정의는 그 항목의 meta.';

create index consultation_requests_created_at_idx
  on consultation_requests (created_at desc);

alter table consultation_requests enable row level security;

-- 익명: 정책 없음 = 전부 거부.
-- 관리자: 읽기·상태 변경. insert/delete 정책은 두지 않는다.
create policy "관리자 상담 신청 읽기" on consultation_requests
  for select to authenticated
  using (true);

create policy "관리자 상담 신청 상태 변경" on consultation_requests
  for update to authenticated
  using (true) with check (true);
