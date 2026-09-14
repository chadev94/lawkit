import { getSiteSettings } from "@/lib/queries/site-settings";
import { getThemePresets } from "@/lib/queries/theme-presets";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const [settings, themePresets] = await Promise.all([
    getSiteSettings(),
    getThemePresets(),
  ]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">사이트 설정</h1>
        <p className="mt-1 text-sm text-zinc-500">
          색상·폰트·공통 문구 등 사이트 전역 구성을 관리합니다. 이후 콘텐츠
          필드도 여기에 확장합니다.
        </p>
      </div>

      <SettingsForm settings={settings} themePresets={themePresets} />
    </main>
  );
}
