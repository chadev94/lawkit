-- 뉴스룸 섹션 종류
-- 항목: subtitle = 카테고리(도아뉴스 등), title = 기사 제목, href = 기사 URL

insert into sections (key, name, description, requires_page, sort_order, is_active)
values (
  'news_room',
  '뉴스룸',
  '뉴스 기사 링크를 카테고리·제목 리스트로 보여 준다.',
  false,
  55,
  true
)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  requires_page = excluded.requires_page,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
