-- Seed CMS content from:
--   https://www.yoopartnerslaw.com/
--   https://yoo-landing.vercel.app/hyeongsa
--   https://www.ddabak.kr/lawyer/
-- Images: scripts/seed-assets → section-media/seed/* (run upload-seed-assets.mjs first).

begin;

-- Fixed IDs currently in yoo&partners-dev
-- home: b56f2db7-1778-455f-a089-5216c308dd6f
-- practice-areas page: 4fa6472e-4c2d-4f63-bad6-fdcbe781fe8e
-- cases page: ba0edb81-d3f6-4e0f-861b-09e35749ff8e
-- lawyer page: 8a9b9ef6-ec0b-440f-9cea-a56155340e1e
-- home hero: 23394099-a6c1-4a09-98cb-00f19ee137c1
-- home practice menu section: 89ee3073-1260-4f3d-bf8a-4f9f8ddfb677
-- home cases menu section: c9a274a9-9560-45e8-afd4-f9e70cd5761f
-- home cta: 090215b8-02a6-4645-8d9c-ddf9f21a0d8f
-- home contact: 4bef9aa8-7381-4f06-a272-63a033d1026f
-- menus: practice 937cb919..., cases 651eb49a..., lawyer 1ca3c769...

update site_settings
set content = jsonb_build_object(
  'site_name', '유앤파트너스',
  'tagline', '판사 옆에서 일한 변호사가, 이제 당신 옆에 섭니다',
  'footer_text', '© 유앤파트너스 법률사무소 · 광고책임변호사 유환진. 본 사이트의 사례는 의뢰인 동의를 받아 비식별 처리되었습니다.',
  'address', '서울특별시 종로구 율곡로 33, 10층 (안국빌딩)',
  'address_detail', '지하철 3호선 안국역 6번 출구 도보 2분',
  'phone', '02-6214-1114',
  'email', 'contact@yoopartnerslaw.com',
  'business_number', '471-47-01088',
  'representative', '유환진',
  'privacy_policy_url', 'https://www.ddabak.kr/privacy/'
)
where key = 'default';

-- Home hero
update page_sections
set
  title = '판사 옆에서 일한 변호사가, 이제 당신 옆에 섭니다',
  subtitle = '경찰에서 연락이 왔다면, 조사 전에 먼저 전화하세요. 사무장이 아닙니다. 전화하면 변호사 본인이 답합니다.',
  content = jsonb_build_object(
    'eyebrow', 'YOO & PARTNERS',
    'cta_label', '무료 전화상담',
    'cta_href', 'tel:0262141114',
    'background_image', 'seed/hero/court.jpg'
  ),
  is_active = true,
  sort_order = 0
where id = '23394099-a6c1-4a09-98cb-00f19ee137c1';

-- Home practice-areas menu section
update page_sections
set
  title = '업무분야',
  subtitle = '같은 사건도 누가, 어떻게 변호하느냐에 따라 결과가 달라집니다.',
  layout = 'bands',
  content = jsonb_build_object(
    'variant', 'bands',
    'show_source', false,
    'stats', '',
    'stats_marks', ''
  ),
  is_active = true,
  sort_order = 1
where id = '89ee3073-1260-4f3d-bf8a-4f9f8ddfb677';

delete from page_section_items
where page_section_id = '89ee3073-1260-4f3d-bf8a-4f9f8ddfb677';

insert into page_section_items (
  page_section_id, sort_order, title, subtitle, body, href, image_path, meta, is_active
) values
(
  '89ee3073-1260-4f3d-bf8a-4f9f8ddfb677', 0,
  '형사 변호',
  'Criminal Defense',
  '폭행·사기·횡령·음주운전·마약·성범죄·명예훼손 등 형사 사건 전반. 경찰 조사 단계부터 대응하여 불기소, 감형, 집행유예 등 최선의 결과를 만들어 갑니다.',
  '#contact',
  'seed/cases/01-card.jpg',
  '{}'::jsonb, true
),
(
  '89ee3073-1260-4f3d-bf8a-4f9f8ddfb677', 1,
  '민사소송',
  'Civil Litigation',
  '계약 분쟁, 손해배상, 건설 대금. 민사소송은 증거 구성이 승패를 가릅니다. 소장 작성부터 법정 변론까지 전 과정을 직접 수행합니다.',
  '#contact',
  'seed/cases/02-card.jpg',
  '{}'::jsonb, true
),
(
  '89ee3073-1260-4f3d-bf8a-4f9f8ddfb677', 2,
  '기업자문',
  'Corporate Advisory',
  '계약서 검토, 내부 규정 정비, 분쟁 예방. 대형로펌에서 기업 자문을 수행한 변호사가 합리적인 비용으로 같은 수준의 자문을 제공합니다.',
  '#contact',
  'seed/cases/03-card.jpg',
  '{}'::jsonb, true
);

-- Home cases menu section
update page_sections
set
  title = '해결사례',
  subtitle = '결과로 보여드립니다. 어려운 사건도 결과를 바꿉니다.',
  layout = 'list',
  is_active = true,
  sort_order = 2
where id = 'c9a274a9-9560-45e8-afd4-f9e70cd5761f';

delete from page_section_items
where page_section_id = 'c9a274a9-9560-45e8-afd4-f9e70cd5761f';

insert into page_section_items (
  page_section_id, sort_order, title, subtitle, body, href, image_path, meta, is_active
) values
(
  'c9a274a9-9560-45e8-afd4-f9e70cd5761f', 0,
  '준강간미수',
  '1심 유죄 → 항소심 무죄',
  '서울고등법원 2026. 6. 4. 피해자 진술의 신빙성을 다퉜습니다. 원심 파기 · 무죄.',
  '/cases',
  'seed/cases/01-card.jpg',
  '{}'::jsonb, true
),
(
  'c9a274a9-9560-45e8-afd4-f9e70cd5761f', 1,
  '특경법 횡령 5억 원 이상',
  '1심 징역 3년 → 선고유예',
  '횡령액을 5억 원 미만으로 다퉈 형법 횡령으로 변경, 선고유예. 서울고등법원 2026. 8. 18.',
  '/cases',
  'seed/cases/02-card.jpg',
  '{}'::jsonb, true
),
(
  'c9a274a9-9560-45e8-afd4-f9e70cd5761f', 2,
  '교통사고 치상·음주운전',
  '1심 집행유예 → 무죄',
  '치상·음주운전 두 죄 모두 무죄. 서울북부지방법원 2026. 8. 27.',
  '/cases',
  'seed/cases/03-card.jpg',
  '{}'::jsonb, true
),
(
  'c9a274a9-9560-45e8-afd4-f9e70cd5761f', 3,
  '사기 기소',
  '1심 무죄',
  '서울남부지방법원 2026. 6. 11. 무죄.',
  '/cases',
  'seed/cases/04-card.jpg',
  '{}'::jsonb, true
),
(
  'c9a274a9-9560-45e8-afd4-f9e70cd5761f', 4,
  '통신매체이용음란 기소',
  '1심 무죄',
  '수원지방법원 2026. 7. 9. 무죄.',
  '/cases',
  'seed/cases/05-card.jpg',
  '{}'::jsonb, true
),
(
  'c9a274a9-9560-45e8-afd4-f9e70cd5761f', 5,
  '강제추행치상',
  '법정형 5년 이상 → 집행유예',
  '징역 1년 6월 · 집행유예 3년. 보호관찰명령 청구 기각. 서울중앙지방법원 2026. 6. 12.',
  '/cases',
  'seed/cases/06-card.jpg',
  '{}'::jsonb, true
);

-- Home CTA
update page_sections
set
  title = '체포·구속은 시간이 생명입니다',
  subtitle = '경찰 연락을 받았다면, 조사 전에 반드시 변호사와 통화하세요.',
  content = jsonb_build_object(
    'badge', 'YOUR SITUATION',
    'button_label', '지금 상담하기'
  ),
  is_active = true,
  sort_order = 3
where id = '090215b8-02a6-4645-8d9c-ddf9f21a0d8f';

-- Home contact
update page_sections
set
  title = '변호사에게 연락하는 게 맞을까, 고민되시죠?',
  subtitle = '모든 상담은 비밀이 보장됩니다. 가족이 대신 오셔도 됩니다. 구속·영장실질심사 사건은 당일 대응합니다.',
  content = jsonb_build_object(
    'consent_label', '개인정보 수집·이용에 동의합니다',
    'submit_label', '상담 신청',
    'success_message', '문의가 접수되었습니다. 변호사가 직접 연락드립니다.'
  ),
  is_active = true,
  sort_order = 4
where id = '4bef9aa8-7381-4f06-a272-63a033d1026f';

-- Practice-areas page: replace placeholder CTA with structured content
delete from page_section_items
where page_section_id in (
  select id from page_sections where page_id = '4fa6472e-4c2d-4f63-bad6-fdcbe781fe8e'
);

delete from page_sections
where page_id = '4fa6472e-4c2d-4f63-bad6-fdcbe781fe8e';

insert into page_sections (
  id, page_id, kind, menu_id, title, subtitle, layout, sort_order, is_active, content
) values
(
  'a1111111-1111-4111-8111-111111111101',
  '4fa6472e-4c2d-4f63-bad6-fdcbe781fe8e',
  'hero', null,
  '업무분야',
  '형사·민사·기업자문. 경찰 조사 단계부터 끝까지 같은 변호사가 함께합니다.',
  'cards', 0, true,
  jsonb_build_object(
    'eyebrow', 'PRACTICE AREAS',
    'cta_label', '상담 신청',
    'cta_href', '/#contact',
    'background_image', 'seed/hero/court.jpg'
  )
),
(
  'a1111111-1111-4111-8111-111111111102',
  '4fa6472e-4c2d-4f63-bad6-fdcbe781fe8e',
  'menu', '937cb919-d83e-4ca9-9c37-9f4560e0f0b7',
  '주요 업무',
  '같은 사건도 누가, 어떻게 변호하느냐에 따라 결과가 달라집니다.',
  'cards', 1, true,
  '{}'::jsonb
);

insert into page_section_items (
  page_section_id, sort_order, title, subtitle, body, href, image_path, meta, is_active
) values
(
  'a1111111-1111-4111-8111-111111111102', 0,
  '형사 변호', '폭행·상해 · 사기 · 횡령·배임 · 음주운전 · 마약 · 성범죄 · 명예훼손',
  '경찰 조사 단계부터 대응하여 불기소, 약식명령, 선고유예, 집행유예 등 최선의 결과를 만들어 갑니다. 첫 조사가 결과를 결정합니다.',
  null,
  'seed/cases/01-card.jpg',
  '{}'::jsonb, true
),
(
  'a1111111-1111-4111-8111-111111111102', 1,
  '민사소송', '계약금 반환 · 매매대금 · 공사대금 · 손해배상 · 임대차',
  '재판연구원으로 민사 사건을 포함한 다양한 판결을 검토한 경험으로, 어떤 증거가 재판부를 움직이는지 알고 전략을 세웁니다.',
  null,
  'seed/cases/02-card.jpg',
  '{}'::jsonb, true
),
(
  'a1111111-1111-4111-8111-111111111102', 2,
  '기업자문', '계약서 · 주주간계약 · 인사·노무 · 공정거래 · 개인정보',
  '문제가 터지기 전에 연락하세요. 정기자문 또는 건별 자문 모두 가능합니다.',
  null,
  'seed/cases/03-card.jpg',
  '{}'::jsonb, true
),
(
  'a1111111-1111-4111-8111-111111111102', 3,
  '채권추심·강제집행', '지급명령 · 가압류 · 소액소송 · 압류·추심',
  '소액 채권도 뒷순위로 미루지 않습니다. 지급명령부터 강제집행까지 전 과정을 담당 변호사가 챙깁니다. (따박따박/유앤파트너스)',
  null,
  'seed/cases/04-card.jpg',
  '{}'::jsonb, true
);

-- Cases page
delete from page_section_items
where page_section_id in (
  select id from page_sections where page_id = 'ba0edb81-d3f6-4e0f-861b-09e35749ff8e'
);
delete from page_sections where page_id = 'ba0edb81-d3f6-4e0f-861b-09e35749ff8e';

insert into page_sections (
  id, page_id, kind, menu_id, title, subtitle, layout, sort_order, is_active, content
) values
(
  'a2222222-2222-4222-8222-222222222201',
  'ba0edb81-d3f6-4e0f-861b-09e35749ff8e',
  'hero', null,
  '결과로 보여드립니다',
  '무죄 4건, 항소심 원심 파기 3건. 전부 2026년 선고입니다. 의뢰인 동의를 받아 비식별 게재했습니다.',
  'cards', 0, true,
  jsonb_build_object(
    'eyebrow', 'CASE RESULTS',
    'cta_label', '상담하기',
    'cta_href', 'tel:0262141114',
    'background_image', 'seed/hero/og.png'
  )
),
(
  'a2222222-2222-4222-8222-222222222202',
  'ba0edb81-d3f6-4e0f-861b-09e35749ff8e',
  'menu', '651eb49a-27b8-4c9a-8693-c68440733c3d',
  '주요 해결사례',
  '어려운 사건도 결과를 바꿉니다.',
  'cards', 1, true,
  '{}'::jsonb
);

insert into page_section_items (
  page_section_id, sort_order, title, subtitle, body, href, image_path, meta, is_active
) values
(
  'a2222222-2222-4222-8222-222222222202', 0,
  '준강간미수', '1심 유죄 → 항소심 무죄 · 서울고등법원',
  '피해자 진술의 신빙성을 다퉈 원심 파기 · 무죄 (2026. 6. 4.).',
  null, 'seed/cases/01-card.jpg', '{}'::jsonb, true
),
(
  'a2222222-2222-4222-8222-222222222202', 1,
  '특경법 횡령 5억 원 이상', '1심 징역 3년 → 선고유예 · 서울고등법원',
  '횡령액을 5억 원 미만으로 다퉈 형법 횡령으로 변경, 선고유예 (2026. 8. 18.).',
  null, 'seed/cases/02-card.jpg', '{}'::jsonb, true
),
(
  'a2222222-2222-4222-8222-222222222202', 2,
  '교통사고 치상·음주운전', '1심 집행유예 → 무죄 · 서울북부지법',
  '치상·음주운전 두 죄 모두 무죄 (2026. 8. 27.).',
  null, 'seed/cases/03-card.jpg', '{}'::jsonb, true
),
(
  'a2222222-2222-4222-8222-222222222202', 3,
  '사기 기소', '1심 무죄 · 서울남부지법',
  '서울남부지방법원 2026. 6. 11. 무죄.',
  null, 'seed/cases/04-card.jpg', '{}'::jsonb, true
),
(
  'a2222222-2222-4222-8222-222222222202', 4,
  '통신매체이용음란 기소', '1심 무죄 · 수원지법',
  '수원지방법원 2026. 7. 9. 무죄.',
  null, 'seed/cases/05-card.jpg', '{}'::jsonb, true
),
(
  'a2222222-2222-4222-8222-222222222202', 5,
  '강제추행치상', '법정형 5년 이상 → 집행유예 · 서울중앙지법',
  '징역 1년 6월 · 집행유예 3년. 보호관찰명령 청구 기각 (2026. 6. 12.).',
  null, 'seed/cases/06-card.jpg', '{}'::jsonb, true
);

-- Lawyer page
delete from page_section_items
where page_section_id in (
  select id from page_sections where page_id = '8a9b9ef6-ec0b-440f-9cea-a56155340e1e'
);
delete from page_sections where page_id = '8a9b9ef6-ec0b-440f-9cea-a56155340e1e';

insert into page_sections (
  id, page_id, kind, menu_id, title, subtitle, layout, sort_order, is_active, content
) values
(
  'a3333333-3333-4333-8333-333333333301',
  '8a9b9ef6-ec0b-440f-9cea-a56155340e1e',
  'hero', null,
  '유환진 대표변호사',
  '경찰 조사부터 항소심까지, 변호사가 직접 맡습니다.',
  'cards', 0, true,
  jsonb_build_object(
    'eyebrow', '서울고등법원 재판연구원 출신',
    'cta_label', '1:1 전화상담',
    'cta_href', 'tel:0262141114',
    'background_image', 'seed/lawyer/profile.jpg'
  )
),
(
  'a3333333-3333-4333-8333-333333333302',
  '8a9b9ef6-ec0b-440f-9cea-a56155340e1e',
  'menu', '1ca3c769-c843-4aac-bc04-ad52618e3a47',
  '경력 · 차별점',
  '재판부가 어떤 증거를 신뢰하고, 어떤 주장을 받아들이는지 압니다.',
  'list', 1, true,
  '{}'::jsonb
);

insert into page_section_items (
  page_section_id, sort_order, title, subtitle, body, href, image_path, meta, is_active
) values
(
  'a3333333-3333-4333-8333-333333333302', 0,
  '유환진', '대표변호사 · 제11회 변호사시험 합격',
  '서울고등법원에서 3년간 500건 이상의 사건을 검토하며, 어떤 증거가 판결을 움직이고 어떤 주장이 받아들여지지 않는지를 가까이서 봤습니다. 그 눈을 가지고 대형로펌에서 형사 사건을 중심으로 실전을 뛰었고, 지금은 의뢰인의 사건에 쓰고 있습니다.',
  null, 'seed/lawyer/profile.jpg', '{}'::jsonb, true
),
(
  'a3333333-3333-4333-8333-333333333302', 1,
  '서울고등법원 재판연구원', '2022–2025',
  '민사·형사·행정 3개 부에서 500건 이상의 사건을 검토하며 재판부의 판단 기준을 체득했습니다.',
  null, 'seed/hero/court.jpg', '{}'::jsonb, true
),
(
  'a3333333-3333-4333-8333-333333333302', 2,
  '법무법인(유한) 화우', '2025–2026',
  '형사 변호와 기업 분쟁 사건에서 재판연구원 경험을 실전에 적용했습니다.',
  null, null, '{}'::jsonb, true
),
(
  'a3333333-3333-4333-8333-333333333302', 3,
  '유앤파트너스 대표변호사', '2026–현재',
  '끝까지 같은 변호사. 처음 만난 변호사가 판결까지 함께합니다. 전화하면 변호사 본인이 받습니다.',
  null, null, '{}'::jsonb, true
),
(
  'a3333333-3333-4333-8333-333333333302', 4,
  '왜 다른가', '서면·증거·양형자료의 기준',
  '서면을 쓸 때 재판부가 판결문에 옮겨 쓸 수 있는지를 기준으로 씁니다. 증거를 다툴 때 재판부가 신빙성을 판단하는 순서대로 반박합니다. 양형자료를 낼 때 양형 이유에 실제로 인용되는 종류의 자료만 골라 냅니다.',
  null, null, '{}'::jsonb, true
);

-- Hide test menu from public nav (keep data)
update menus set is_active = false where slug = 'test';
update pages set is_active = false where slug = 'test';

commit;
