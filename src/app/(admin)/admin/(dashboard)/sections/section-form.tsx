"use client";

import { useActionState, useState } from "react";
import {
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_CTA_CONTENT,
  DEFAULT_HERO_CONTENT,
  parseContactContent,
  parseCtaContent,
  parseHeroContent,
} from "@/lib/section-content";
import { SECTION_LAYOUT_LABEL, type Section, type SitePage } from "@/lib/sections";
import { createSection, type ActionState } from "./actions";
import { ImageField, ItemListEditor, toDraftItems } from "./section-fields";

const initialState: ActionState = { error: null };

export function SectionForm({
  pageId,
  pages,
  sectionKinds,
}: {
  pageId: string;
  pages: SitePage[];
  sectionKinds: Section[];
}) {
  const defaultKind = sectionKinds[0]?.key ?? "";
  const [kind, setKind] = useState(defaultKind);
  const [hero, setHero] = useState(DEFAULT_HERO_CONTENT);
  const [cta, setCta] = useState(DEFAULT_CTA_CONTENT);
  const [contact, setContact] = useState(DEFAULT_CONTACT_CONTENT);
  const [items, setItems] = useState(toDraftItems([]));
  const [state, formAction, pending] = useActionState(
    createSection,
    initialState,
  );

  const selected = sectionKinds.find((item) => item.key === kind);
  const requiresPage = selected?.requires_page ?? false;
  const mediaFolder = `draft/${pageId}`;

  if (sectionKinds.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-500">
        등록 가능한 섹션 종류가 없습니다. sections 테이블에 종류를 추가하세요.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4"
    >
      <input type="hidden" name="page_id" value={pageId} />

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">섹션 종류</span>
          <select
            name="kind"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setItems(toDraftItems([]));
            }}
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          >
            {sectionKinds.map((item) => (
              <option key={item.key} value={item.key}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        {requiresPage && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">연결할 페이지</span>
            <select
              name="source_page_id"
              required
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">선택하세요</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
          </label>
        )}

        {requiresPage && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">표시 방식</span>
            <select
              name="layout"
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            >
              {Object.entries(SECTION_LAYOUT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px]">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">
            제목 <span className="text-zinc-300">(비우면 메뉴명 사용)</span>
          </span>
          <input
            name="title"
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">부제</span>
          <input
            name="subtitle"
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">순서</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {kind === "hero" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">아이브로우</span>
            <input
              name="content_eyebrow"
              value={hero.eyebrow}
              onChange={(e) =>
                setHero(parseHeroContent({ ...hero, eyebrow: e.target.value }))
              }
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">CTA 라벨</span>
            <input
              name="content_cta_label"
              value={hero.cta_label}
              onChange={(e) =>
                setHero(
                  parseHeroContent({ ...hero, cta_label: e.target.value }),
                )
              }
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">CTA 링크</span>
            <input
              name="content_cta_href"
              value={hero.cta_href}
              onChange={(e) =>
                setHero(parseHeroContent({ ...hero, cta_href: e.target.value }))
              }
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <ImageField
            label="배경 이미지"
            name="content_background_image"
            value={hero.background_image}
            folder={mediaFolder}
            onChange={(path) =>
              setHero(parseHeroContent({ ...hero, background_image: path }))
            }
          />
        </div>
      )}

      {kind === "cta" && (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500">배지</span>
              <input
                name="content_badge"
                value={cta.badge}
                onChange={(e) =>
                  setCta(parseCtaContent({ ...cta, badge: e.target.value }))
                }
                className="rounded border border-zinc-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500">버튼 라벨</span>
              <input
                name="content_button_label"
                value={cta.button_label}
                onChange={(e) =>
                  setCta(
                    parseCtaContent({ ...cta, button_label: e.target.value }),
                  )
                }
                className="rounded border border-zinc-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <ItemListEditor
            kind="cta"
            items={items}
            onChange={setItems}
            folder={mediaFolder}
          />
        </div>
      )}

      {kind === "contact" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">동의 문구</span>
            <input
              name="content_consent_label"
              value={contact.consent_label}
              onChange={(e) =>
                setContact(
                  parseContactContent({
                    ...contact,
                    consent_label: e.target.value,
                  }),
                )
              }
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">제출 버튼</span>
            <input
              name="content_submit_label"
              value={contact.submit_label}
              onChange={(e) =>
                setContact(
                  parseContactContent({
                    ...contact,
                    submit_label: e.target.value,
                  }),
                )
              }
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">성공 메시지</span>
            <input
              name="content_success_message"
              value={contact.success_message}
              onChange={(e) =>
                setContact(
                  parseContactContent({
                    ...contact,
                    success_message: e.target.value,
                  }),
                )
              }
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}

      {kind === "page_link" && (
        <ItemListEditor
          kind="page_link"
          items={items}
          onChange={setItems}
          folder={mediaFolder}
        />
      )}

      {kind !== "page_link" && kind !== "cta" && (
        <input type="hidden" name="items_json" value="[]" />
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "추가 중..." : "섹션 추가"}
      </button>
    </form>
  );
}
