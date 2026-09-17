-- 테마 프리셋의 글자 대비를 WCAG AA(4.5:1) 기준에 맞춘다.
--
-- 왜: 어드민 크리틱(2026-09-16)에서 공개 홈의 저대비 15건이 전부 site_settings 색에서
-- 나왔다. 프리셋 자체도 다섯 개 중 다섯 개가 한 곳 이상 미달이었다.
-- 변호사가 프리셋을 고르면 그 자체로 안전해야 한다.
--
-- 방법: 색상(인상)은 그대로 두고 밝기만 조금 낮춰 4.5:1 을 넘기는 첫 값을 골랐다.
-- 검사 조합은 src/lib/contrast.ts 의 SITE_CONTRAST_CHECKS 와 같다.
--
--   classic-navy     accent           #a3843c → #8c7133   (3.55 → 4.64)
--   modern-charcoal  accent           #a1a1aa → #73737a   (2.56 → 4.71)
--                    muted_foreground #71717a → #6d6d76   (4.40 → 4.66)
--   trust-blue       muted_foreground #64748b → #606f85   (4.34 → 4.66)
--   burgundy         muted_foreground #8a6f68 → #806760   (4.09 → 4.63)
--   forest           muted_foreground #667569 → #617167   (4.14 → 4.63)
--
-- 이미 저장된 site_settings 는 건드리지 않는다. 그건 변호사의 선택이고,
-- 어드민 색 화면이 미달을 표시해 주므로 거기서 고친다.

update theme_presets
set colors = colors || '{"accent": "#8c7133"}'::jsonb
where slug = 'classic-navy';

update theme_presets
set colors = colors || '{"accent": "#73737a", "muted_foreground": "#6d6d76"}'::jsonb
where slug = 'modern-charcoal';

update theme_presets
set colors = colors || '{"muted_foreground": "#606f85"}'::jsonb
where slug = 'trust-blue';

update theme_presets
set colors = colors || '{"muted_foreground": "#806760"}'::jsonb
where slug = 'burgundy';

update theme_presets
set colors = colors || '{"muted_foreground": "#617167"}'::jsonb
where slug = 'forest';
