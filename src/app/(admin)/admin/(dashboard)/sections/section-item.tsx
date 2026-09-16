"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  parseContactContent,
  parseCtaContent,
  parseHeroContent,
  type ContactContent,
  type CtaContent,
  type HeroContent,
} from "@/lib/section-content";
import {
  SECTION_LAYOUT_LABEL,
  type PageSection,
  type PageSectionItem,
  type SectionLayout,
  type SitePage,
} from "@/lib/sections";
import {
  deleteSection,
  toggleSection,
  updateSection,
  type ActionState,
} from "./actions";
import {
  ImageField,
  ItemListEditor,
  toDraftItems,
  type DraftItem,
} from "./section-fields";

const initialState: ActionState = { error: null };

const field =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900";
const fieldLabel = "text-xs text-zinc-500";

/**
 * 목록의 한 줄. 열면 편집 폼이 펼쳐지고, 입력하는 값은 그때그때
 * onDraft 로 올라가 오른쪽 미리보기에 반영된다(저장 전).
 */
export function SectionItem({
  section,
  pages,
  editing,
  onEditToggle,
  onDraft,
  onFieldFocus,
}: {
  section: PageSection;
  pages: SitePage[];
  editing: boolean;
  onEditToggle: () => void;
  onDraft: (draft: PageSection | null) => void;
  onFieldFocus: (field: string | null) => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateSection,
    initialState,
  );

  const kindLabel = section.section?.name ?? section.kind;
  const requiresPage = section.section?.requires_page ?? false;

  return (
    <li className={editing ? "bg-zinc-50" : undefined}>
      {/* 고정 격자. 제목 길이와 무관하게 상태·동작이 같은 자리에 온다. */}
      <div className="grid grid-cols-[2rem_minmax(0,1fr)_4.5rem_auto] items-center gap-3 px-4 py-2.5">
        <span className="text-xs tabular-nums text-zinc-400">
          {section.sort_order}
        </span>

        <button
          type="button"
          onClick={onEditToggle}
          className="min-w-0 text-left"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-500">
              {kindLabel}
            </span>
            <span className="truncate text-sm font-medium">
              {section.title ?? section.source_page?.title ?? "—"}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-xs text-zinc-400">
            {requiresPage
              ? `/${section.source_page?.slug ?? "?"} · ${SECTION_LAYOUT_LABEL[section.layout]} · 항목 ${section.items.length}`
              : (section.subtitle ?? `항목 ${section.items.length}`)}
          </span>
        </button>

        <form
          action={async () => {
            await toggleSection(section.id, section.page_id, !section.is_active);
          }}
        >
          <button
            type="submit"
            className={`w-full rounded-full px-2 py-1 text-[11px] ${
              section.is_active
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {section.is_active ? "노출중" : "숨김"}
          </button>
        </form>

        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={onEditToggle}
            className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
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
              className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-zinc-500 hover:border-red-500 hover:text-red-600"
            >
              삭제
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <SectionEditForm
          key={section.id}
          section={section}
          pages={pages}
          requiresPage={requiresPage}
          state={state}
          formAction={formAction}
          pending={pending}
          onDraft={onDraft}
          onFieldFocus={onFieldFocus}
          onClose={onEditToggle}
        />
      )}
    </li>
  );
}

function SectionEditForm({
  section,
  pages,
  requiresPage,
  state,
  formAction,
  pending,
  onDraft,
  onFieldFocus,
  onClose,
}: {
  section: PageSection;
  pages: SitePage[];
  requiresPage: boolean;
  state: ActionState;
  formAction: (payload: FormData) => void;
  pending: boolean;
  onDraft: (draft: PageSection | null) => void;
  onFieldFocus: (field: string | null) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(section.title ?? "");
  const [subtitle, setSubtitle] = useState(section.subtitle ?? "");
  const [sortOrder, setSortOrder] = useState(String(section.sort_order));
  const [isActive, setIsActive] = useState(section.is_active);
  const [layout, setLayout] = useState<SectionLayout>(section.layout);
  const [sourcePageId, setSourcePageId] = useState(
    section.source_page_id ?? "",
  );
  const [hero, setHero] = useState<HeroContent>(() =>
    parseHeroContent(section.content),
  );
  const [cta, setCta] = useState<CtaContent>(() =>
    parseCtaContent(section.content),
  );
  const [contact, setContact] = useState<ContactContent>(() =>
    parseContactContent(section.content),
  );
  const [items, setItems] = useState<DraftItem[]>(() =>
    toDraftItems(section.items),
  );
  const mediaFolder = section.id;
  const wasPendingRef = useRef(false);

  // 입력칸에 커서를 두면 미리보기에서 그 요소만 따로 표시한다.
  const focusProps = (fieldName: string) => ({
    onFocus: () => onFieldFocus(fieldName),
    onBlur: () => onFieldFocus(null),
  });

  // 편집 중인 값을 미리보기로 올린다. 저장과 무관하게 입력 즉시 반영된다.
  useEffect(() => {
    const content =
      section.kind === "hero"
        ? { ...hero }
        : section.kind === "cta"
          ? { ...cta }
          : section.kind === "contact"
            ? { ...contact }
            : {};
    const linked = pages.find((page) => page.id === sourcePageId) ?? null;

    onDraft({
      ...section,
      title: title.trim() === "" ? null : title,
      subtitle: subtitle.trim() === "" ? null : subtitle,
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
      layout,
      source_page_id: sourcePageId === "" ? null : sourcePageId,
      source_page: linked
        ? { id: linked.id, title: linked.title, slug: linked.slug }
        : requiresPage
          ? null
          : section.source_page,
      content,
      items: toPreviewItems(items, section.id),
    });
  }, [
    section,
    pages,
    requiresPage,
    title,
    subtitle,
    sortOrder,
    isActive,
    layout,
    sourcePageId,
    hero,
    cta,
    contact,
    items,
    onDraft,
  ]);

  // 폼이 닫힐 때 미리보기를 저장된 값으로 되돌린다.
  useEffect(() => () => onDraft(null), [onDraft]);

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
      className="flex flex-col gap-3 border-t border-zinc-200 px-4 pb-4 pt-3"
    >
      <input type="hidden" name="id" value={section.id} />
      <input type="hidden" name="page_id" value={section.page_id} />
      <input type="hidden" name="kind" value={section.kind} />

      {requiresPage && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className={fieldLabel}>연결할 페이지</span>
            <select
              name="source_page_id"
              required
              value={sourcePageId}
              onChange={(e) => setSourcePageId(e.target.value)}
              className={field}
            >
              <option value="">선택하세요</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className={fieldLabel}>표시 방식</span>
            <select
              name="layout"
              value={layout}
              onChange={(e) => setLayout(e.target.value as SectionLayout)}
              className={field}
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

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_5rem_6rem]">
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>
            제목 <span className="text-zinc-300">(비우면 메뉴명 사용)</span>
          </span>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            {...focusProps("title")}
            className={field}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>부제</span>
          <input
            name="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            {...focusProps("subtitle")}
            className={field}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>순서</span>
          <input
            name="sort_order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={field}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>노출</span>
          <select
            name="is_active"
            value={isActive ? "true" : "false"}
            onChange={(e) => setIsActive(e.target.value === "true")}
            className={field}
          >
            <option value="true">노출중</option>
            <option value="false">숨김</option>
          </select>
        </label>
      </div>

      {section.kind === "hero" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className={fieldLabel}>아이브로우</span>
            <input
              name="content_eyebrow"
              value={hero.eyebrow}
              onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
              {...focusProps("content.eyebrow")}
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={fieldLabel}>CTA 라벨</span>
            <input
              name="content_cta_label"
              value={hero.cta_label}
              onChange={(e) => setHero({ ...hero, cta_label: e.target.value })}
              {...focusProps("content.cta_label")}
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={fieldLabel}>CTA 링크</span>
            <input
              name="content_cta_href"
              value={hero.cta_href}
              onChange={(e) => setHero({ ...hero, cta_href: e.target.value })}
              className={field}
            />
          </label>
          <ImageField
            label="배경 이미지"
            name="content_background_image"
            value={hero.background_image}
            folder={mediaFolder}
            onChange={(path) => setHero({ ...hero, background_image: path })}
          />
        </div>
      )}

      {section.kind === "cta" && (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>배지</span>
              <input
                name="content_badge"
                value={cta.badge}
                onChange={(e) => setCta({ ...cta, badge: e.target.value })}
                {...focusProps("content.badge")}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>버튼 라벨</span>
              <input
                name="content_button_label"
                value={cta.button_label}
                onChange={(e) =>
                  setCta({ ...cta, button_label: e.target.value })
                }
                {...focusProps("content.button_label")}
                className={field}
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
            <span className={fieldLabel}>동의 문구</span>
            <input
              name="content_consent_label"
              value={contact.consent_label}
              onChange={(e) =>
                setContact({ ...contact, consent_label: e.target.value })
              }
              {...focusProps("content.consent_label")}
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={fieldLabel}>제출 버튼</span>
            <input
              name="content_submit_label"
              value={contact.submit_label}
              onChange={(e) =>
                setContact({ ...contact, submit_label: e.target.value })
              }
              {...focusProps("content.submit_label")}
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={fieldLabel}>성공 메시지</span>
            <input
              name="content_success_message"
              value={contact.success_message}
              onChange={(e) =>
                setContact({ ...contact, success_message: e.target.value })
              }
              className={field}
            />
          </label>
        </div>
      )}

      {section.kind === "page_link" && (
        <ItemListEditor
          kind="page_link"
          items={items}
          onChange={setItems}
          folder={mediaFolder}
        />
      )}

      {section.kind !== "page_link" && section.kind !== "cta" && (
        <input type="hidden" name="items_json" value="[]" />
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
        >
          취소
        </button>
        <span className="text-xs text-zinc-400">
          입력칸을 누르면 오른쪽에서 그 부분이 표시됩니다. 저장해야 사이트에
          적용됩니다.
        </span>
      </div>
    </form>
  );
}

/** 편집 중 항목(임시 키) → 미리보기용 항목. 저장 전이라 id 는 임시값이다. */
function toPreviewItems(
  items: DraftItem[],
  sectionId: string,
): PageSectionItem[] {
  return items.map((item, index) => ({
    id: item.id ?? `draft-${item.key}`,
    page_section_id: sectionId,
    sort_order: item.sort_order ?? index,
    title: item.title,
    subtitle: item.subtitle,
    body: item.body,
    href: item.href,
    image_path: item.image_path,
    meta: item.meta ?? {},
    is_active: item.is_active !== false,
  }));
}
