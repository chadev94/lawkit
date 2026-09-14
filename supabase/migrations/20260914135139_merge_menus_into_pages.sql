-- menus 를 pages 로 통합
--
-- menus 와 pages 는 같은 정보(slug, 이름, 순서, 활성)를 두 곳에 들고 있었고
-- 메뉴 하나를 만들면 페이지가 항상 1:1 로 따라 생겼다. 이름을 바꾸면 두 테이블을
-- 함께 고쳐야 하고, 수동 롤백으로 묶여 있어 중간에 실패하면 어긋난다.
--
-- pages 하나로 합친다. 헤더 네비게이션은 pages.show_in_nav 로 고른다.
--
--   menus                       → 삭제
--   pages.menu_id               → 삭제, show_in_nav 추가
--   page_sections.menu_id       → source_page_id (pages 참조)
--   sections.requires_menu      → requires_page
--   sections.key 'menu'         → 'page_link'
--
-- 순서가 중요하다. page_sections 이관은 pages.menu_id 가 살아 있을 때 해야 하고,
-- sections.key 는 page_sections.kind 가 FK 로 참조하므로 새 키를 먼저 넣는다.


-- ───────────────────────────────────────────────
-- 1) pages: 네비 노출 플래그
-- ───────────────────────────────────────────────
alter table pages
  add column show_in_nav boolean not null default true;

comment on column pages.show_in_nav is
  '헤더 네비게이션에 노출할지. 홈은 로고가 그 역할을 하므로 false.';

update pages set show_in_nav = false where slug = 'home';

-- menu_id 를 참조하는 다중 컬럼 제약은 컬럼 삭제 전에 명시적으로 지운다
alter table pages drop constraint pages_home_menu_null;


-- ───────────────────────────────────────────────
-- 2) page_sections: menu_id → source_page_id
-- ───────────────────────────────────────────────
alter table page_sections
  add column source_page_id uuid references pages (id) on delete cascade;

comment on column page_sections.source_page_id is
  '콘텐츠를 끌어올 페이지. requires_page 인 종류에서만 쓴다. 연결 페이지가 지워지면 섹션도 지운다.';

update page_sections ps
set source_page_id = p.id
from pages p
where p.menu_id = ps.menu_id
  and ps.menu_id is not null;

-- 대응 페이지가 없는 메뉴 참조가 있으면 여기서 멈춘다. 데이터를 잃지 않기 위한 방어다.
do $$
begin
  if exists (
    select 1 from page_sections
    where menu_id is not null and source_page_id is null
  ) then
    raise exception 'page_sections.menu_id 중 대응하는 pages 행이 없는 것이 있다';
  end if;
end
$$;

alter table page_sections drop column menu_id;

create index page_sections_source_page_idx
  on page_sections (source_page_id);


-- ───────────────────────────────────────────────
-- 3) sections: requires_menu → requires_page, 'menu' → 'page_link'
-- ───────────────────────────────────────────────
-- 옛 트리거가 requires_menu 를 읽으므로 컬럼 이름을 바꾸기 전에 먼저 내린다. (새 트리거는 4)에서 만든다)
drop trigger if exists page_sections_menu_ref on page_sections;
drop function if exists enforce_page_section_menu_ref();

alter table sections rename column requires_menu to requires_page;

comment on column sections.requires_page is
  'true 이면 섹션 등록 시 source_page_id 가 필요하다.';
comment on column sections.key is
  'page_sections.kind 가 참조하는 식별자. 코드의 컴포넌트 switch 키와 같아야 한다.';
comment on table sections is '페이지에 배치할 수 있는 섹션 종류 마스터.';

-- page_sections.kind 가 sections.key 를 FK 로 참조하므로 새 키 → 자식 갱신 → 옛 키 삭제 순
insert into sections (key, name, description, requires_page, sort_order, is_active)
select 'page_link', '페이지 연결', '다른 페이지의 콘텐츠를 카드·리스트로 보여준다',
       true, sort_order, is_active
from sections
where key = 'menu';

update page_sections set kind = 'page_link' where kind = 'menu';

delete from sections where key = 'menu';


-- ───────────────────────────────────────────────
-- 4) 정합성 트리거 갱신
-- ───────────────────────────────────────────────
create or replace function enforce_page_section_source_ref()
returns trigger
language plpgsql
as $$
declare
  needs_page boolean;
begin
  select requires_page into needs_page
  from sections
  where key = new.kind;

  if needs_page is null then
    raise exception 'unknown section kind: %', new.kind;
  end if;

  if needs_page and new.source_page_id is null then
    raise exception 'section kind "%" requires source_page_id', new.kind;
  end if;

  if not needs_page and new.source_page_id is not null then
    raise exception 'section kind "%" must not have source_page_id', new.kind;
  end if;

  -- 자기 페이지를 자기 안에 끌어오는 것은 의미가 없다
  if new.source_page_id is not null and new.source_page_id = new.page_id then
    raise exception 'source_page_id must differ from page_id';
  end if;

  return new;
end;
$$;

create trigger page_sections_source_ref
  before insert or update on page_sections
  for each row execute function enforce_page_section_source_ref();


-- ───────────────────────────────────────────────
-- 5) menus 제거
-- ───────────────────────────────────────────────
alter table pages drop column menu_id;

comment on table pages is '라우팅되는 페이지. 홈은 slug=home → URL /, 그 외는 /{slug}. 헤더 메뉴 역할도 겸한다.';

drop table menus;
