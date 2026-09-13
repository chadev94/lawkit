-- 사이트 전역 설정 (브랜드/테마/콘텐츠)
-- 싱글톤: key = 'default' 한 행만 사용한다.
-- colors / typography / content 는 jsonb 로 확장한다.

create table site_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique default 'default',
  colors     jsonb not null default '{}'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  content    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint site_settings_key_format check (key ~ '^[a-z0-9_-]+$')
);

comment on table site_settings is '사이트 전역 설정. colors/typography/content 를 jsonb 로 확장한다.';
comment on column site_settings.colors is 'CSS 변수로 매핑되는 색 토큰.';
comment on column site_settings.typography is '폰트 패밀리 등 타이포 토큰.';
comment on column site_settings.content is '사이트명, 태그라인, 푸터 문구 등 공통 카피.';

create trigger site_settings_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

insert into site_settings (key, colors, typography, content)
values (
  'default',
  '{
    "background": "#ffffff",
    "foreground": "#171717",
    "muted": "#f4f4f5",
    "muted_foreground": "#71717a",
    "primary": "#18181b",
    "primary_foreground": "#fafafa",
    "border": "#e4e4e7",
    "accent": "#a1a1aa",
    "hero_background": "#18181b",
    "hero_foreground": "#fafafa"
  }'::jsonb,
  '{
    "font_sans": "geist",
    "font_heading": "geist"
  }'::jsonb,
  '{
    "site_name": "YOO & PARTNERS",
    "tagline": "",
    "footer_text": ""
  }'::jsonb
);

alter table site_settings enable row level security;

-- 공개 사이트는 설정 읽기만
create policy "사이트 설정 공개 읽기" on site_settings
  for select to anon
  using (true);

create policy "관리자 사이트 설정 전체 접근" on site_settings
  for all to authenticated
  using (true) with check (true);
