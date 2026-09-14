-- 테마 프리셋 카탈로그
-- 어드민 사이트 설정에서 색상 세트를 한 번에 선택하는 용도.
-- 선택 시 프리셋의 colors 가 site_settings.colors 로 복사되며,
-- 공개 사이트 렌더링은 여전히 site_settings 만 읽는다.

create table theme_presets (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  label       text not null,
  description text not null default '',
  colors      jsonb not null default '{}'::jsonb,
  is_default  boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint theme_presets_slug_format check (slug ~ '^[a-z0-9_-]+$')
);

comment on table theme_presets is '어드민에서 선택하는 색상 테마 프리셋. 선택 시 site_settings.colors 로 복사된다.';
comment on column theme_presets.colors is 'site_settings.colors 와 동일한 색 토큰 세트.';
comment on column theme_presets.is_default is '신규 사이트 기본 테마. 한 행만 true.';

-- 기본 프리셋은 하나만 허용
create unique index theme_presets_single_default
  on theme_presets (is_default) where is_default;

create trigger theme_presets_updated_at
  before update on theme_presets
  for each row execute function set_updated_at();

insert into theme_presets (slug, label, description, colors, is_default, sort_order)
values
  (
    'classic-navy',
    '클래식 네이비',
    '딥 네이비에 골드 포인트. 전통 있는 로펌의 무게감.',
    '{
      "background": "#ffffff",
      "foreground": "#1c2433",
      "muted": "#f3f5f9",
      "muted_foreground": "#5f6b80",
      "primary": "#1e3a5f",
      "primary_foreground": "#f7f9fc",
      "border": "#dbe1eb",
      "accent": "#a3843c",
      "hero_background": "#152944",
      "hero_foreground": "#f2ecdc"
    }'::jsonb,
    false,
    10
  ),
  (
    'modern-charcoal',
    '모던 차콜',
    '무채색 미니멀. 어떤 콘텐츠와도 충돌하지 않는 기본값.',
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
    true,
    20
  ),
  (
    'trust-blue',
    '트러스트 블루',
    '선명한 로열블루. 젊고 적극적인 사무소의 인상.',
    '{
      "background": "#ffffff",
      "foreground": "#0f172a",
      "muted": "#f1f5f9",
      "muted_foreground": "#64748b",
      "primary": "#1d4ed8",
      "primary_foreground": "#ffffff",
      "border": "#e2e8f0",
      "accent": "#4f6fae",
      "hero_background": "#1e3a8a",
      "hero_foreground": "#e8efff"
    }'::jsonb,
    false,
    30
  ),
  (
    'burgundy',
    '버건디',
    '와인레드와 크림. 중후하고 클래식한 분위기.',
    '{
      "background": "#fffcf9",
      "foreground": "#2d1b1b",
      "muted": "#f8f0ea",
      "muted_foreground": "#8a6f68",
      "primary": "#6d1f2c",
      "primary_foreground": "#fbf3ea",
      "border": "#e9dcd2",
      "accent": "#9c5a52",
      "hero_background": "#451420",
      "hero_foreground": "#f0e2d2"
    }'::jsonb,
    false,
    40
  ),
  (
    'forest',
    '포레스트',
    '딥그린과 베이지. 차분하고 안정적인 신뢰감.',
    '{
      "background": "#fcfdfb",
      "foreground": "#1d2a23",
      "muted": "#eff4ee",
      "muted_foreground": "#68796e",
      "primary": "#2f5741",
      "primary_foreground": "#f3f7f1",
      "border": "#dce5db",
      "accent": "#5d7a63",
      "hero_background": "#1f3d2c",
      "hero_foreground": "#e9f1e3"
    }'::jsonb,
    false,
    50
  );

alter table theme_presets enable row level security;

-- 프리셋은 관리자 화면에서만 읽는다. 쓰기는 마이그레이션으로만 한다.
create policy "관리자 테마 프리셋 읽기" on theme_presets
  for select to authenticated
  using (true);
