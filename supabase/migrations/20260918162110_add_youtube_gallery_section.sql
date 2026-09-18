-- 유튜브 가로 갤러리 섹션 종류
-- 항목(page_section_items): title = 영상 제목, href = 유튜브 URL
-- content: more_label / more_href = 하단 「더보기」 버튼

insert into sections (key, name, description, requires_page, sort_order, is_active)
values (
  'youtube_gallery',
  '유튜브 갤러리',
  '유튜브 링크 목록을 가로로 보여 주고, 하단 더보기로 채널·페이지에 연결한다.',
  false,
  50,
  true
)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  requires_page = excluded.requires_page,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
