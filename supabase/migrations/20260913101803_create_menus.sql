-- 메뉴
--
-- 사이트에 어떤 메뉴를 노출할지 admin에서 등록·관리한다.
-- 앞으로 만들 콘텐츠 테이블들이 이 메뉴에 붙는다.
--
-- 고객사마다 필요한 메뉴가 다르므로 코드에 하드코딩하지 않는다.

create table menus (
  id         uuid    primary key default gen_random_uuid(),
  name       text    not null,
  slug       text    not null unique,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint menus_slug_format check (slug ~ '^[a-z0-9-]+$')
);

comment on table menus is '사이트 메뉴. admin에서 등록하면 공개 사이트 네비게이션에 반영된다.';
comment on column menus.slug is 'URL 경로. 소문자, 숫자, 하이픈만 허용한다.';
comment on column menus.is_active is '끄면 공개 사이트에서 사라진다. 삭제하지 않고 숨길 때 쓴다.';

create index menus_active_idx on menus (is_active, sort_order);

-- updated_at 자동 갱신
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger menus_updated_at
  before update on menus
  for each row execute function set_updated_at();


-- ───────────────────────────────────────────────
-- RLS
--
-- anon key는 브라우저에 노출되는 것이 전제다. 누구나 REST API를 직접
-- 호출할 수 있으므로 접근 통제는 전적으로 여기서 이루어진다.
-- ───────────────────────────────────────────────
alter table menus enable row level security;

-- 방문자는 켜져 있는 메뉴만 본다
create policy "활성 메뉴 공개" on menus
  for select to anon
  using (is_active);

-- 변호사(로그인 사용자)는 전부 보고 수정한다
create policy "관리자 전체 접근" on menus
  for all to authenticated
  using (true) with check (true);
