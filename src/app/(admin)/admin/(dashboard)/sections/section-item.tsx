"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Menu } from "@/lib/queries/menus";
import {
  parseContactContent,
  parseCtaContent,
  parseHeroContent,
} from "@/lib/section-content";
import {
  SECTION_LAYOUT_LABEL,
  type PageSection,
} from "@/lib/sections";
import {
  deleteSection,
  toggleSection,
  updateSection,
  type ActionState,
} from "./actions";
import { ImageField, ItemListEditor, toDraftItems } from "./section-fields";

const initialState: ActionState = { error: null };

export function SectionItem({
  section,
  menus,
}: {
  section: PageSection;
  menus: Menu[];
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateSection,
    initialState,
  );

  const kindLabel = section.section?.name ?? section.kind;
  const requiresMenu = section.section?.requires_menu ?? false;

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="w-8 text-xs text-zinc-400">{section.sort_order}</span>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">
              {kindLabel}
            </span>
            <p className="text-sm font-medium">
              {section.title ?? section.menu?.name ?? "—"}
            </p>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            {requiresMenu
              ? `/${section.menu?.slug ?? "?"} · ${SECTION_LAYOUT_LABEL[section.layout]} · 항목 ${section.items.length}`
              : (section.subtitle ?? `항목 ${section.items.length}`)}
          </p>
        </div>

        <form
          action={async () => {
            await toggleSection(
              section.id,
              section.page_id,
              !section.is_active,
            );
          }}
        >
          <button
            type="submit"
            className={`rounded px-2 py-1 text-xs ${
              section.is_active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-400"
            }`}
          >
            {section.is_active ? "노출중" : "숨김"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="text-xs text-zinc-500 hover:text-zinc-900"
        >
          {editing ? "닫기" : "수정"}
        </button>

        <form
          action={async () => {
            await deleteSection(section.id, section.page_id);
          }}
        >
          <button
            type="submit"
            className="text-xs text-zinc-400 hover:text-red-600"
          >
            삭제
          </button>
        </form>
      </div>

      {editing && (
        <SectionEditForm
          key={section.id}
          section={section}
          menus={menus}
          requiresMenu={requiresMenu}
          state={state}
          formAction={formAction}
          pending={pending}
          onClose={() => setEditing(false)}
        />
      )}
    </li>
  );
}

function SectionEditForm({
  section,
  menus,
  requiresMenu,
  state,
  formAction,
  pending,
  onClose,
}: {
  section: PageSection;
  menus: Menu[];
  requiresMenu: boolean;
  state: ActionState;
  formAction: (payload: FormData) => void;
  pending: boolean;
  onClose: () => void;
}) {
  const [hero, setHero] = useState(() => parseHeroContent(section.content));
  const [cta, setCta] = useState(() => parseCtaContent(section.content));
  const [contact, setContact] = useState(() =>
    parseContactContent(section.content),
  );
  const [items, setItems] = useState(() => toDraftItems(section.items));
  const mediaFolder = section.id;
  const wasPendingRef = useRef(false);

  useEffect(() => {
    if (pending) {
      wasPendingRef.current = true;
      return;
    }
    if (wasPendingRef.current && state.error === null) {
      wasPendingRef.current = false;
      onClose();
      return;
    }
    wasPendingRef.current = false;
  }, [pending, state.error, onClose]);

  return (
    <form
      action={formAction}
      className="mt-4 flex flex-col gap-3 rounded-md border border-zinc-100 bg-zinc-50 p-4"
    >
      <input type="hidden" name="id" value={section.id} />
      <input type="hidden" name="page_id" value={section.page_id} />
      <input type="hidden" name="kind" value={section.kind} />

      {requiresMenu && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">연결할 메뉴</span>
            <select
              name="menu_id"
              required
              defaultValue={section.menu_id ?? ""}
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">선택하세요</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">표시 방식</span>
            <select
              name="layout"
              defaultValue={section.layout}
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              {Object.entries(SECTION_LAYOUT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_120px]">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">
            제목 <span className="text-zinc-300">(비우면 메뉴명 사용)</span>
          </span>
          <input
            name="title"
            defaultValue={section.title ?? ""}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">부제</span>
          <input
            name="subtitle"
            defaultValue={section.subtitle ?? ""}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">순서</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={section.sort_order}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">노출</span>
          <select
            name="is_active"
            defaultValue={section.is_active ? "true" : "false"}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="true">노출중</option>
            <option value="false">숨김</option>
          </select>
        </label>
      </div>

      {section.kind === "hero" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">아이브로우</span>
            <input
              name="content_eyebrow"
              value={hero.eyebrow}
              onChange={(e) =>
                setHero(parseHeroContent({ ...hero, eyebrow: e.target.value }))
              }
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
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
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
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
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
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

      {section.kind === "cta" && (
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
                className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
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
                className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
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

      {section.kind === "contact" && (
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
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
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
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
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
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}

      {section.kind === "menu" && (
        <ItemListEditor
          kind="menu"
          items={items}
          onChange={setItems}
          folder={mediaFolder}
        />
      )}

      {section.kind !== "menu" && section.kind !== "cta" && (
        <input type="hidden" name="items_json" value="[]" />
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900"
        >
          취소
        </button>
      </div>
    </form>
  );
}
