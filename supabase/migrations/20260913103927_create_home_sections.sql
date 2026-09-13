-- 메인 페이지 섹션 구성
--
-- 메뉴와 메인 페이지 구성을 분리한다.
--   menus         사이트가 가진 항목. 헤더 네비게이션에 쓰인다.
--   home_sections 그중 무엇을, 몇 개, 어떤 순서로, 어떤 형태로 메인에 노출할지
--
-- 메뉴 하나를 메인에 두 번(다른 형태로) 띄우거나, 헤더에만 두고 메인에서
-- 빼는 것이 가능하다. 히어로·CTA·상담폼처럼 메뉴와 무관한 섹션도 같은
-- 구조로 다룬다.

create table home_sections (
  id         uuid primary key default gen_random_uuid(),

  -- 섹션 종류
  --   hero     히어로 배너
  --   menu     메뉴에 연결된 콘텐츠 섹션
  --   cta      상담 진단 위젯
  --   contact  상담 문의 폼
  kind       text not null,

  -- kind = 'menu' 일 때만 사용한다
  menu_id    uuid references menus (id) on delete cascade,

  -- 비우면 연결된 메뉴 이름을 쓴다
  title      text,
  subtitle   text,

  -- kind = 'menu' 일 때 표시 방식
  layout     text not null default 'cards',

  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint home_sections_kind_check
    check (kind in ('hero', 'menu', 'cta', 'contact')),

  constraint home_sections_layout_check
    check (layout in ('cards', 'carousel', 'list')),

  -- menu 섹션은 반드시 메뉴를 참조하고, 나머지는 참조하지 않는다
  constraint home_sections_menu_ref_check
    check ((kind = 'menu') = (menu_id is not null))
);

comment on table home_sections is
  '메인 페이지 섹션 구성. admin에서 순서와 노출 여부를 정한다.';
comment on column home_sections.kind is
  'hero | menu | cta | contact. menu 는 menus 테이블의 항목을 끌어온다.';
comment on column home_sections.title is
  '비우면 연결된 메뉴 이름을 사용한다.';

create index home_sections_active_idx on home_sections (is_active, sort_order);

create trigger home_sections_updated_at
  before update on home_sections
  for each row execute function set_updated_at();


-- ───────────────────────────────────────────────
-- RLS — menus 와 동일한 정책
-- ───────────────────────────────────────────────
alter table home_sections enable row level security;

create policy "활성 섹션 공개" on home_sections
  for select to anon
  using (is_active);

create policy "관리자 전체 접근" on home_sections
  for all to authenticated
  using (true) with check (true);
