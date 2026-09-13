-- 섹션 종류 마스터
--
-- 메인에 올릴 수 있는 섹션 타입을 DB에서 관리한다.
-- home_sections.kind 가 이 테이블의 key 를 참조한다.
-- 실제 렌더 컴포넌트 매핑은 코드(switch)에 남는다.

create table sections (
  id             uuid primary key default gen_random_uuid(),
  key            text not null unique,
  name           text not null,
  description    text,
  requires_menu  boolean not null default false,
  sort_order     integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint sections_key_format check (key ~ '^[a-z0-9_]+$')
);

comment on table sections is '메인 페이지에 사용할 수 있는 섹션 종류 마스터.';
comment on column sections.id is '내부 식별자. 공개 라우팅/컴포넌트 매핑은 key 를 쓴다.';
comment on column sections.key is 'home_sections.kind 가 참조하는 식별자. 코드의 컴포넌트 switch 키와 같아야 한다.';
comment on column sections.requires_menu is 'true 이면 섹션 등록 시 menus 연결이 필요하다.';

create index sections_active_idx on sections (is_active, sort_order);

create trigger sections_updated_at
  before update on sections
  for each row execute function set_updated_at();

-- 기존 하드코딩 종류를 시드
insert into sections (key, name, description, requires_menu, sort_order) values
  ('hero',    '히어로',       '히어로 배너',           false, 10),
  ('menu',    '메뉴 연결',    '메뉴에 연결된 콘텐츠',   true,  20),
  ('cta',     '상담 진단',    '상담 진단 위젯',         false, 30),
  ('contact', '상담 문의 폼', '상담 문의 폼',           false, 40);

-- home_sections.kind 를 sections.key FK 로 전환
alter table home_sections
  drop constraint home_sections_kind_check;

alter table home_sections
  add constraint home_sections_kind_fkey
  foreign key (kind) references sections (key);

-- 메뉴 연결 여부는 sections.requires_menu 가 기준이므로
-- kind/menu_id 정합성 제약은 DB 트리거로 유지한다.
alter table home_sections
  drop constraint home_sections_menu_ref_check;

create or replace function enforce_home_section_menu_ref()
returns trigger
language plpgsql
as $$
declare
  needs_menu boolean;
begin
  select requires_menu into needs_menu
  from sections
  where key = new.kind;

  if needs_menu is null then
    raise exception 'unknown section kind: %', new.kind;
  end if;

  if needs_menu and new.menu_id is null then
    raise exception 'section kind "%" requires menu_id', new.kind;
  end if;

  if not needs_menu and new.menu_id is not null then
    raise exception 'section kind "%" must not have menu_id', new.kind;
  end if;

  return new;
end;
$$;

create trigger home_sections_menu_ref
  before insert or update on home_sections
  for each row execute function enforce_home_section_menu_ref();


-- ───────────────────────────────────────────────
-- RLS — menus / home_sections 와 동일 정책
-- ───────────────────────────────────────────────
alter table sections enable row level security;

create policy "활성 섹션 종류 공개" on sections
  for select to anon
  using (is_active);

create policy "관리자 전체 접근" on sections
  for all to authenticated
  using (true) with check (true);
