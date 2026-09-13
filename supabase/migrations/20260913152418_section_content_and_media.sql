-- 섹션 콘텐츠 CMS
-- page_sections.content (스칼라/단일 미디어)
-- page_section_items (리스트 행)
-- Storage bucket: section-media

alter table page_sections
  add column if not exists content jsonb not null default '{}'::jsonb;

comment on column page_sections.content is
  'kind별 스칼라·단일 미디어 경로. 스키마는 앱(section-content.ts)이 정의한다.';

create table page_section_items (
  id               uuid primary key default gen_random_uuid(),
  page_section_id  uuid not null references page_sections (id) on delete cascade,
  sort_order       integer not null default 0,
  title            text,
  subtitle         text,
  body             text,
  href             text,
  image_path       text,
  meta             jsonb not null default '{}'::jsonb,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table page_section_items is
  '섹션 반복 항목(카드, CTA 선택지 등). page_sections 에 종속한다.';

create index page_section_items_section_idx
  on page_section_items (page_section_id, is_active, sort_order);

create trigger page_section_items_updated_at
  before update on page_section_items
  for each row execute function set_updated_at();

alter table page_section_items enable row level security;

create policy "활성 섹션 아이템 공개" on page_section_items
  for select to anon
  using (
    is_active
    and exists (
      select 1
      from page_sections ps
      join pages p on p.id = ps.page_id
      where ps.id = page_section_id
        and ps.is_active
        and p.is_active
    )
  );

create policy "관리자 섹션 아이템 전체 접근" on page_section_items
  for all to authenticated
  using (true) with check (true);


-- Storage: section-media (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'section-media',
  'section-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- anon: 읽기만
create policy "section-media public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'section-media');

-- authenticated: 업로드/교체/삭제
create policy "section-media authenticated insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'section-media');

create policy "section-media authenticated update"
  on storage.objects for update to authenticated
  using (bucket_id = 'section-media')
  with check (bucket_id = 'section-media');

create policy "section-media authenticated delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'section-media');
