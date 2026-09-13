-- 페이지 레이아웃 정규화
--
-- pages          : 라우팅되는 화면 (홈 + 메뉴 페이지 등)
-- page_sections  : 해당 페이지의 섹션 배치 (구 home_sections)
--
-- 홈은 slug = 'home' 으로 두고, 앱에서 URL '/' 에 매핑한다.

create table pages (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null,
  menu_id    uuid references menus (id) on delete cascade,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint pages_slug_format check (slug ~ '^[a-z0-9-]+$'),
  constraint pages_home_menu_null check (
    (slug = 'home' and menu_id is null) or (slug <> 'home')
  )
);

comment on table pages is '라우팅되는 페이지. 홈은 slug=home, 메뉴 페이지는 menus.slug 와 맞춘다.';
comment on column pages.slug is '공개 경로 식별자. 홈은 home → URL /, 그 외는 /{slug}.';
comment on column pages.menu_id is '메뉴에서 파생된 페이지일 때 연결. 홈은 null.';

create index pages_active_idx on pages (is_active, sort_order);

create trigger pages_updated_at
  before update on pages
  for each row execute function set_updated_at();

-- 홈 페이지
insert into pages (slug, title, menu_id, sort_order)
values ('home', '홈', null, 0);

-- 기존 메뉴 → 페이지
insert into pages (slug, title, menu_id, sort_order, is_active)
select m.slug, m.name, m.id, m.sort_order, m.is_active
from menus m;


create table page_sections (
  id         uuid primary key default gen_random_uuid(),
  page_id    uuid not null references pages (id) on delete cascade,
  kind       text not null references sections (key),
  menu_id    uuid references menus (id) on delete cascade,
  title      text,
  subtitle   text,
  layout     text not null default 'cards',
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint page_sections_layout_check
    check (layout in ('cards', 'carousel', 'list'))
);

comment on table page_sections is '페이지별 섹션 배치. 종류는 sections, 메뉴 연결 콘텐츠는 menu_id.';

create index page_sections_page_idx on page_sections (page_id, is_active, sort_order);

create trigger page_sections_updated_at
  before update on page_sections
  for each row execute function set_updated_at();

-- requires_menu 정합성 (구 home_sections 트리거와 동일)
create or replace function enforce_page_section_menu_ref()
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

create trigger page_sections_menu_ref
  before insert or update on page_sections
  for each row execute function enforce_page_section_menu_ref();

-- home_sections → page_sections (홈으로)
insert into page_sections (
  id, page_id, kind, menu_id, title, subtitle, layout, sort_order, is_active, created_at, updated_at
)
select
  hs.id,
  p.id,
  hs.kind,
  hs.menu_id,
  hs.title,
  hs.subtitle,
  hs.layout,
  hs.sort_order,
  hs.is_active,
  hs.created_at,
  hs.updated_at
from home_sections hs
cross join pages p
where p.slug = 'home';


-- RLS
alter table pages enable row level security;
alter table page_sections enable row level security;

create policy "활성 페이지 공개" on pages
  for select to anon
  using (is_active);

create policy "관리자 페이지 전체 접근" on pages
  for all to authenticated
  using (true) with check (true);

create policy "활성 페이지 섹션 공개" on page_sections
  for select to anon
  using (
    is_active
    and exists (
      select 1 from pages p
      where p.id = page_id and p.is_active
    )
  );

create policy "관리자 페이지 섹션 전체 접근" on page_sections
  for all to authenticated
  using (true) with check (true);


-- 구 테이블 정리
drop trigger if exists home_sections_menu_ref on home_sections;
drop function if exists enforce_home_section_menu_ref();
drop table home_sections;
