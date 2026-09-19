-- 이미지 갤러리 섹션
-- 항목: image_path = 사진(storage path 또는 /public 경로), title = 선택 캡션, href = 선택 링크
-- 모바일: 2열 격자 / md 이상: 가로 스크롤 리스트

insert into sections (key, name, description, requires_page, sort_order, is_active)
values (
  'image_gallery',
  '이미지 갤러리',
  '사진을 모바일에서는 격자로, 큰 화면에서는 가로 리스트로 보여 준다.',
  false,
  60,
  true
)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  requires_page = excluded.requires_page,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
