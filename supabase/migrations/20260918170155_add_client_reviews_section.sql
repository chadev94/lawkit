-- 의뢰인 후기 섹션
-- featured 항목: title=사건명, subtitle=결과 한 줄, image_path=카톡 캡처
-- grid 항목: meta.role='grid', image_path=추가 캡처, title=선택 라벨

insert into sections (key, name, description, requires_page, sort_order, is_active)
values (
  'client_reviews',
  '의뢰인 후기',
  '판결 직후 의뢰인 메시지. 상단 강조 카드 캐러셀 + 하단 캡처 그리드.',
  false,
  65,
  true
)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  requires_page = excluded.requires_page,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
