"use client";

import { useActionState } from "react";
import {
  COLOR_FIELDS,
  FONT_OPTIONS,
  type SiteSettings,
} from "@/lib/site-settings";
import { updateSiteSettings, type ActionState } from "./actions";
import { AddressSearchInput } from "./address-search-input";

const initialState: ActionState = { error: null };

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(
    updateSiteSettings,
    initialState,
  );

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">브랜드 콘텐츠</h2>
          <p className="mt-1 text-xs text-zinc-500">
            사이트명·태그라인 등 공통 문구. 이후 필드가 늘어날 수 있습니다.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-zinc-500">사이트명</span>
            <input
              name="site_name"
              defaultValue={settings.content.site_name}
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-zinc-500">태그라인</span>
            <input
              name="tagline"
              defaultValue={settings.content.tagline}
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-zinc-500">푸터 문구</span>
            <input
              name="footer_text"
              defaultValue={settings.content.footer_text}
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">연락·사업자 정보</h2>
          <p className="mt-1 text-xs text-zinc-500">
            푸터에 노출되는 주소·연락처·사업자 정보입니다.
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
            <span className="text-xs text-zinc-500">전화</span>
            <input
              name="phone"
              defaultValue={settings.content.phone}
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">이메일</span>
            <input
              name="email"
              type="email"
              defaultValue={settings.content.email}
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">사업자등록번호</span>
            <input
              name="business_number"
              defaultValue={settings.content.business_number}
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">대표변호사</span>
            <input
              name="representative"
              defaultValue={settings.content.representative}
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-zinc-500">개인정보처리방침 URL</span>
            <input
              name="privacy_policy_url"
              type="url"
              placeholder="https://"
              defaultValue={settings.content.privacy_policy_url}
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">색상</h2>
          <p className="mt-1 text-xs text-zinc-500">
            공개 사이트 CSS 변수로 적용됩니다. OS 다크모드와 무관하게 고정됩니다.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {COLOR_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500">{label}</span>
              <input
                type="color"
                name={`color_${key}`}
                defaultValue={settings.colors[key]}
                className="h-9 w-full max-w-[12rem] cursor-pointer rounded border border-zinc-300 bg-white p-1"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">타이포그래피</h2>
          <p className="mt-1 text-xs text-zinc-500">
            목록에 있는 폰트만 선택 가능합니다. Google Fonts는 자동 로드됩니다.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">본문 폰트</span>
            <select
              name="font_sans"
              defaultValue={settings.typography.font_sans}
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">제목 폰트</span>
            <select
              name="font_heading"
              defaultValue={settings.typography.font_heading}
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
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

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "저장 중..." : "설정 저장"}
      </button>
    </form>
  );
}
