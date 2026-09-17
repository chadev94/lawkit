"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { PageSections } from "@/components/site/page-sections";
import type { PageSection } from "@/lib/sections";
import {
  FONT_OPTIONS,
  parseContent,
  parseTypography,
  type SiteColors,
  type SiteContent,
  type SiteSettings,
  type SiteTypography,
} from "@/lib/site-settings";
import { type ThemePreset } from "@/lib/theme-presets";
import {
  SitePreviewFrame,
  type PreviewNavItem,
} from "@/app/(admin)/admin/site-preview";
import { toast } from "@/app/(admin)/admin/toast";
import { updateSiteSettings, type ActionState } from "./actions";
import { AddressSearchInput } from "./address-search-input";
import { ThemeColorSection } from "./theme-color-section";

const initialState: ActionState = { error: null };

/** 폼 안의 문구 입력 이름. 미리보기 표식(data-field="content.<이름>")과 같다. */
const CONTENT_KEYS = new Set<keyof SiteContent>([
  "site_name",
  "tagline",
  "footer_text",
  "address",
  "address_detail",
  "phone",
  "email",
  "business_number",
  "representative",
  "privacy_policy_url",
]);

/**
 * 좌: 설정 폼 / 우: 미리보기.
 * 폼의 어느 칸이든 바뀌면 FormData 를 다시 읽어 편집 중 설정(draft)을 만들고
 * 미리보기에 넘긴다. 저장 전에도 사무소 이름·색·글꼴이 오른쪽에 바로 보인다.
 */
export function SettingsForm({
  settings,
  themePresets,
  nav,
  homeSections,
}: {
  settings: SiteSettings;
  themePresets: ThemePreset[];
  nav: PreviewNavItem[];
  homeSections: PageSection[];
}) {
  const [state, formAction, pending] = useActionState(
    updateSiteSettings,
    initialState,
  );
  const [colors, setColors] = useState<SiteColors>(settings.colors);
  const [typography, setTypography] = useState<SiteTypography>(
    settings.typography,
  );
  const [content, setContent] = useState<SiteContent>(settings.content);
  const [activeField, setActiveField] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPendingRef = useRef(false);

  // 폼 전체에서 한 번에 읽는다. AddressSearchInput 처럼 내부 상태를 가진 칸도 함께 잡힌다.
  function syncFromForm() {
    if (!formRef.current) return;
    const raw = Object.fromEntries(new FormData(formRef.current));
    setContent(parseContent(raw));
    setTypography(parseTypography(raw));
  }

  useEffect(() => {
    if (pending) {
      wasPendingRef.current = true;
      return;
    }
    if (wasPendingRef.current && state.error === null) {
      wasPendingRef.current = false;
      toast({
        message: "저장됨 · 사이트 전체에 반영되었습니다",
        link: { href: "/", label: "사이트에서 보기" },
      });
    }
  }, [pending, state.error]);

  const draft: SiteSettings = { ...settings, colors, typography, content };
  const dirty =
    JSON.stringify(draft.colors) !== JSON.stringify(settings.colors) ||
    JSON.stringify(draft.typography) !== JSON.stringify(settings.typography) ||
    JSON.stringify(draft.content) !== JSON.stringify(settings.content);
  const visibleHome = homeSections.filter((s) => s.is_active);

  function onFocusCapture(e: React.FocusEvent<HTMLFormElement>) {
    const target = e.target as unknown as { name?: string };
    const name = target.name ?? "";
    if (name && CONTENT_KEYS.has(name as keyof SiteContent)) {
      setActiveField(`content.${name === "address_detail" ? "address" : name}`);
    }
  }

  return (
    <div className="a-workbench">
      <form
        ref={formRef}
        action={formAction}
        onInput={syncFromForm}
        onChange={syncFromForm}
        onFocusCapture={onFocusCapture}
        onBlurCapture={() => setActiveField(null)}
        className="flex min-w-0 flex-col gap-8"
      >
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold">사무소 이름과 문구</h2>
            <p className="a-hint mt-1">
              상단 메뉴 왼쪽과 맨 아래(꼬리말)에 나옵니다.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="a-label">사무소 이름</span>
              <input
                name="site_name"
                placeholder="예: 유앤파트너스"
                defaultValue={settings.content.site_name}
                className="a-input"
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="a-label">
                한 줄 소개{" "}
                <span style={{ color: "var(--a-ink-3)" }}>
                  꼬리말 이름 아래
                </span>
              </span>
              <input
                name="tagline"
                placeholder="예: 형사 사건, 변호사가 직접 받습니다"
                defaultValue={settings.content.tagline}
                className="a-input"
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="a-label">
                맨 아래 문구{" "}
                <span style={{ color: "var(--a-ink-3)" }}>
                  비우면 © 연도 사무소 이름
                </span>
              </span>
              <input
                name="footer_text"
                placeholder="예: © 2026 유앤파트너스. All rights reserved."
                defaultValue={settings.content.footer_text}
                className="a-input"
              />
            </label>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold">연락처 · 사업자 정보</h2>
            <p className="a-hint mt-1">
              맨 아래(꼬리말)에 나옵니다. 주소가 있으면 지도가 함께 뜹니다.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <AddressSearchInput
              name="address"
              detailName="address_detail"
              defaultValue={settings.content.address}
              defaultDetail={settings.content.address_detail}
            />
            <label className="flex flex-col gap-1">
              <span className="a-label">전화</span>
              <input
                name="phone"
                defaultValue={settings.content.phone}
                className="a-input"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="a-label">이메일</span>
              <input
                name="email"
                type="email"
                defaultValue={settings.content.email}
                className="a-input"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="a-label">사업자등록번호</span>
              <input
                name="business_number"
                defaultValue={settings.content.business_number}
                className="a-input"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="a-label">대표변호사</span>
              <input
                name="representative"
                defaultValue={settings.content.representative}
                className="a-input"
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="a-label">개인정보처리방침 URL</span>
              <input
                name="privacy_policy_url"
                type="url"
                placeholder="https://"
                defaultValue={settings.content.privacy_policy_url}
                className="a-input"
              />
            </label>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold">사이트 색</h2>
            <p className="a-hint mt-1">
              통과하는 조합을 고르거나 직접 조정합니다. 글자가 읽히는지 바로
              검사합니다.
            </p>
          </div>
          <ThemeColorSection
            presets={themePresets}
            colors={colors}
            onColorsChange={setColors}
          />
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold">글꼴</h2>
            <p className="a-hint mt-1">
              본문과 제목을 따로 고릅니다. 오른쪽에서 바로 바뀝니다.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="a-label">본문 글꼴</span>
              <select
                name="font_sans"
                defaultValue={settings.typography.font_sans}
                className="a-input"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="a-label">제목 글꼴</span>
              <select
                name="font_heading"
                defaultValue={settings.typography.font_heading}
                className="a-input"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="a-sticky-actions sticky bottom-0 flex items-center justify-end gap-2 py-3">
          {state.error && <p className="a-error mr-auto">⚠ {state.error}</p>}
          {!state.error && dirty && (
            <p className="a-hint mr-auto">
              저장 전 · 오른쪽은 지금 입력한 값입니다
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="a-btn a-btn-primary"
          >
            {pending ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>

      <div className="a-workbench-preview min-w-0">
        <SitePreviewFrame
          settings={draft}
          nav={nav}
          label="사이트 전체 · 홈"
          dirty={dirty}
          activeField={activeField}
          scrollToSelector={
            activeField === "content.site_name" ? '[data-field="header"]' : null
          }
        >
          {visibleHome.length === 0 ? (
            <p className="a-hint px-6 py-24 text-center">
              홈에 노출 중인 블록이 없습니다.
            </p>
          ) : (
            <PageSections sections={visibleHome} />
          )}
        </SitePreviewFrame>
      </div>
    </div>
  );
}
