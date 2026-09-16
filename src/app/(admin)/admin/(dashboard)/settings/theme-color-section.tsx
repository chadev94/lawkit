"use client";

import { COLOR_FIELDS, type SiteColors } from "@/lib/site-settings";
import { colorsMatchPreset, type ThemePreset } from "@/lib/theme-presets";

/**
 * 색상 섹션: 프리셋 카드로 한 번에 선택하고,
 * 세부 색상은 접힌 영역에서 개별 조정한다.
 * 개별 색을 바꾸면 프리셋 선택 표시가 해제된다(사용자 지정 상태).
 * 색상 상태는 미리보기와 공유하기 위해 부모(SettingsForm)가 소유한다.
 */
export function ThemeColorSection({
  presets,
  colors,
  onColorsChange,
}: {
  presets: ThemePreset[];
  colors: SiteColors;
  onColorsChange: (colors: SiteColors) => void;
}) {
  const activePreset = presets.find((p) => colorsMatchPreset(colors, p));

  return (
    <div className="flex flex-col gap-4">
      {presets.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {presets.map((preset) => {
            const c = preset.colors;
            const active = activePreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onColorsChange(c)}
                aria-pressed={active}
                className={`flex items-center gap-3 rounded border px-3 py-2.5 text-left transition-colors ${
                  active
                    ? "a-swatch-on"
                    : "a-swatch-off"
                }`}
              >
                <span
                  aria-hidden
                  className="h-9 w-9 shrink-0 rounded-full"
                  style={{
                    background: `conic-gradient(${c.hero_background} 0 40%, ${c.primary} 40% 70%, ${c.accent} 70% 88%, ${c.muted} 88% 100%)`,
                  }}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {preset.label}
                  </span>
                  <span className="a-hint block truncate">
                    {preset.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {presets.length > 0 && !activePreset && (
        <p className="a-label">
          사용자 지정 색상을 사용 중입니다. 프리셋을 누르면 해당 세트로
          바뀝니다.
        </p>
      )}

      <details open={presets.length === 0}>
        <summary className="a-label cursor-pointer font-medium">
          세부 색상 조정
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {COLOR_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="a-label">{label}</span>
              <input
                type="color"
                name={`color_${key}`}
                value={colors[key]}
                onChange={(e) =>
                  onColorsChange({ ...colors, [key]: e.target.value })
                }
                className="a-input h-9 max-w-[12rem] cursor-pointer p-1"
              />
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}
