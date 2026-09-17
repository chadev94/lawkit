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
import { ConfirmDeleteButton } from "@/app/(admin)/admin/confirm-delete";
import { OrderButtons } from "@/app/(admin)/admin/order-buttons";
import { toast } from "@/app/(admin)/admin/toast";
import {
  deleteSection,
  moveSection,
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

const field = "a-input";

/** 종류별 예시 문구. 빈 칸에 회색으로 보인다. */
const PLACEHOLDER: Record<"title" | "subtitle", Record<string, string>> = {
  title: {
    hero: "예: 판사 옆에서 일한 변호사가, 이제 당신 옆에 섭니다",
    page_link: "예: 주요 해결사례",
    cta: "예: 체포·구속은 시간이 생명입니다",
    contact: "예: 변호사에게 연락하는 게 맞을까, 고민되시죠?",
  },
  subtitle: {
    hero: "예: 경찰에서 연락이 왔다면, 조사 전에 먼저 전화하세요",
    page_link: "예: 같은 사건도 누가 변호하느냐에 따라 결과가 달라집니다",
    cta: "예: 질문 4개에 답하면 지금 필요한 대응을 알려 드립니다",
    contact: "예: 모든 상담은 비밀이 보장됩니다",
  },
};
const fieldLabel = "a-label";

/**
 * 목록의 한 줄. 열면 편집 폼이 펼쳐지고, 입력하는 값은 그때그때
 * onDraft 로 올라가 오른쪽 미리보기에 반영된다(저장 전).
 */
export function SectionItem({
  section,
  pages,
  editing,
  position,
  count,
  pagePath,
  flash,
  onEditToggle,
  onDraft,
  onFieldFocus,
  onSaved,
}: {
  section: PageSection;
  pages: SitePage[];
  editing: boolean;
  /** 목록에서의 위치(0부터). ▲▼ 활성 판단 */
  position: number;
  count: number;
  /** 공개 사이트 경로. 토스트의 "사이트에서 보기" */
  pagePath: string;
  /** 방금 저장돼 잠깐 빛나야 하는가 */
  flash: boolean;
  onEditToggle: () => void;
  onDraft: (draft: PageSection | null) => void;
  onFieldFocus: (field: string | null) => void;
  onSaved: (id: string) => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateSection,
    initialState,
  );

  const kindLabel = section.section?.name ?? section.kind;
  const requiresPage = section.section?.requires_page ?? false;
  const displayName = section.title ?? section.source_page?.title ?? "—";

  return (
    <li className={editing ? "a-row-open" : undefined}>
      {/* 고정 격자. 제목 길이와 무관하게 상태·동작이 같은 자리에 온다. */}
      <div className="a-row" data-flash={flash || undefined}>
        <span className="a-row-ord">
          <OrderButtons
            canUp={position > 0}
            canDown={position < count - 1}
            label={`${displayName} 블록`}
            onMove={async (direction) => {
              await moveSection(section.id, section.page_id, direction);
              toast({
                message: "순서가 바뀌었습니다 · 사이트에 반영",
                link: { href: pagePath, label: "사이트에서 보기" },
              });
            }}
          />
          <span>{position + 1}</span>
        </span>

        <button type="button" onClick={onEditToggle} className="a-row-main">
          <span className="flex min-w-0 items-center gap-2">
            <span className="a-chip">{kindLabel}</span>
            <span className="a-row-name">{displayName}</span>
          </span>
          <span className="a-row-sub">
            {requiresPage
              ? `/${section.source_page?.slug ?? "?"} · ${SECTION_LAYOUT_LABEL[section.layout]} · 항목 ${section.items.length}`
              : (section.subtitle ?? `항목 ${section.items.length}`)}
          </span>
        </button>

        <form
          action={async () => {
            await toggleSection(
              section.id,
              section.page_id,
              !section.is_active,
            );
            toast({
              message: section.is_active
                ? "숨겼습니다 · 사이트에서 사라집니다"
                : "노출합니다 · 사이트에 나타납니다",
              link: { href: pagePath, label: "사이트에서 보기" },
            });
          }}
        >
          <button
            type="submit"
            className={`a-badge ${section.is_active ? "a-badge-ok" : "a-badge-off"}`}
          >
            {section.is_active ? "노출중" : "숨김"}
          </button>
        </form>

        <div className="a-row-acts">
          <button
            type="button"
            onClick={onEditToggle}
            className="a-btn a-btn-default a-btn-sm"
          >
            {editing ? "닫기" : "수정"}
          </button>
          <ConfirmDeleteButton
            note={
              section.items.length > 0
                ? `항목 ${section.items.length}개도 함께 삭제됩니다`
                : undefined
            }
            onConfirm={async () => {
              await deleteSection(section.id, section.page_id);
              toast({ message: `"${displayName}" 블록을 삭제했습니다` });
            }}
          />
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
          onSaved={() => {
            onSaved(section.id);
            toast({
              message: "저장됨 · 사이트에 반영되었습니다",
              link: { href: pagePath, label: "사이트에서 보기" },
            });
          }}
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
  onSaved,
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
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(section.title ?? "");
  const [subtitle, setSubtitle] = useState(section.subtitle ?? "");
  const [sortOrder] = useState(String(section.sort_order));
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
      onSaved();
      onClose();
      return;
    }
    wasPendingRef.current = false;
  }, [pending, state.error, onClose, onSaved]);

  // 칸 단위 오류. 서버가 field 를 돌려주면 그 칸만 빨갛게, 문구는 그 아래.
  const invalid = (name: string) =>
    state.error && state.field === name
      ? ({ "aria-invalid": true } as const)
      : undefined;
  const fieldError = (name: string) =>
    state.error && state.field === name ? (
      <span className="a-field-error">⚠ {state.error}</span>
    ) : null;

  return (
    <form action={formAction} className="a-editor">
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

      {/* 순서는 목록의 ▲▼ 로 바꾼다. 값은 그대로 보내 서버가 덮어쓰지 않게 한다. */}
      <input type="hidden" name="sort_order" value={sortOrder} />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>
            제목{" "}
            {requiresPage && (
              <span style={{ color: "var(--a-ink-3)" }}>
                (비우면 연결한 페이지 이름)
              </span>
            )}
          </span>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={PLACEHOLDER.title[section.kind] ?? "예: 업무분야"}
            {...focusProps("title")}
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

      <label className="flex flex-col gap-1">
        <span className={fieldLabel}>
          부제{" "}
          <span style={{ color: "var(--a-ink-3)" }}>(비우면 표시 안 함)</span>
        </span>
        <input
          name="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder={PLACEHOLDER.subtitle[section.kind] ?? ""}
          {...focusProps("subtitle")}
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={fieldLabel}>
          부제{" "}
          <span style={{ color: "var(--a-ink-3)" }}>(비우면 표시 안 함)</span>
        </span>
        <input
          name="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder={PLACEHOLDER.subtitle[section.kind] ?? ""}
          className={field}
          {...focusProps("subtitle")}
        />
      </label>

      {section.kind === "hero" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className={fieldLabel}>
              작은 제목 (위){" "}
              <span style={{ color: "var(--a-ink-3)" }}>제목 위에 작게</span>
            </span>
            <input
              name="content_eyebrow"
              value={hero.eyebrow}
              onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
              placeholder="예: YOO & PARTNERS"
              {...focusProps("content.eyebrow")}
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={fieldLabel}>버튼 글자</span>
            <input
              name="content_cta_label"
              value={hero.cta_label}
              onChange={(e) => setHero({ ...hero, cta_label: e.target.value })}
              placeholder="예: 무료 전화상담"
              {...focusProps("content.cta_label")}
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={fieldLabel}>
              버튼 누르면 가는 곳{" "}
              <span style={{ color: "var(--a-ink-3)" }}>
                전화는 tel:, 페이지는 /주소
              </span>
            </span>
            <input
              name="content_cta_href"
              value={hero.cta_href}
              onChange={(e) => setHero({ ...hero, cta_href: e.target.value })}
              placeholder="예: tel:02-000-0000 또는 /contact"
              className={field}
              {...invalid("content_cta_href")}
            />
            {fieldError("content_cta_href")}
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
              <span className={fieldLabel}>
                작은 제목 (위){" "}
                <span style={{ color: "var(--a-ink-3)" }}>제목 위에 작게</span>
              </span>
              <input
                name="content_badge"
                value={cta.badge}
                onChange={(e) => setCta({ ...cta, badge: e.target.value })}
                placeholder="예: YOUR SITUATION"
                {...focusProps("content.badge")}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>버튼 글자</span>
              <input
                name="content_button_label"
                value={cta.button_label}
                placeholder="예: 지금 상담하기"
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
            onFieldFocus={onFieldFocus}
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
              placeholder="예: 개인정보 수집·이용에 동의합니다"
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
              placeholder="예: 상담 신청"
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
              placeholder="예: 문의가 접수되었습니다. 변호사가 직접 연락드립니다"
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
          onFieldFocus={onFieldFocus}
        />
      )}

      {section.kind !== "page_link" && section.kind !== "cta" && (
        <input type="hidden" name="items_json" value="[]" />
      )}

      {state.error && !state.field && (
        <p className="a-error">⚠ {state.error}</p>
      )}

      <div className="a-editor-actions">
        <button
          type="submit"
          disabled={pending}
          className="a-btn a-btn-primary"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        <button type="button" onClick={onClose} className="a-btn a-btn-default">
          취소
        </button>
        <span className="a-hint">
          고치는 동안 오른쪽에서 결과가 보입니다. 저장하면 사이트에 바로
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
