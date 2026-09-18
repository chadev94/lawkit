"use client";

import { useActionState, useState } from "react";
import {
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_CTA_CONTENT,
  DEFAULT_CLIENT_REVIEWS_CONTENT,
  DEFAULT_HERO_CONTENT,
  DEFAULT_YOUTUBE_GALLERY_CONTENT,
  parseContactContent,
  parseCtaContent,
  parseClientReviewsContent,
  parseHeroContent,
  parseYoutubeGalleryContent,
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
  const [youtube, setYoutube] = useState(DEFAULT_YOUTUBE_GALLERY_CONTENT);
  const [reviews, setReviews] = useState(DEFAULT_CLIENT_REVIEWS_CONTENT);
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
      <p className="a-card a-lead p-4">
        등록 가능한 섹션 종류가 없습니다. sections 테이블에 종류를 추가하세요.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="a-panel flex flex-col gap-3 p-4"
    >
      <input type="hidden" name="page_id" value={pageId} />

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="a-label">블록 종류</span>
          <select
            name="kind"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setItems(toDraftItems([]));
            }}
            className="a-input"
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
            <span className="a-label">연결할 페이지</span>
            <select
              name="source_page_id"
              required
              className="a-input"
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
            <span className="a-label">표시 방식</span>
            <select
              name="layout"
              className="a-input"
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
          <span className="a-label">
            제목 <span style={{ color: "var(--a-ink-3)" }}>(비우면 연결한 페이지 이름)</span>
          </span>
          <input
            name="title"
            className="a-input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="a-label">부제</span>
          <input
            name="subtitle"
            className="a-input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="a-label">순서</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            className="a-input"
          />
        </label>
      </div>

      {kind === "hero" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="a-label">작은 제목 (위)</span>
            <input
              name="content_eyebrow"
            placeholder="예: YOO & PARTNERS"
              value={hero.eyebrow}
              onChange={(e) =>
                setHero(parseHeroContent({ ...hero, eyebrow: e.target.value }))
              }
              className="a-input"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="a-label">버튼 글자</span>
            <input
              name="content_cta_label"
            placeholder="예: 무료 전화상담"
              value={hero.cta_label}
              onChange={(e) =>
                setHero(
                  parseHeroContent({ ...hero, cta_label: e.target.value }),
                )
              }
              className="a-input"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="a-label">버튼 누르면 가는 곳</span>
            <input
              name="content_cta_href"
            placeholder="예: tel:02-000-0000 또는 /contact"
              value={hero.cta_href}
              onChange={(e) =>
                setHero(parseHeroContent({ ...hero, cta_href: e.target.value }))
              }
              className="a-input"
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
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="a-label">배경 영상 경로</span>
            <input
              name="content_background_video"
              placeholder="예: /hero/background.mp4"
              value={hero.background_video}
              onChange={(e) =>
                setHero(
                  parseHeroContent({
                    ...hero,
                    background_video: e.target.value,
                  }),
                )
              }
              className="a-input"
            />
            <span className="text-xs text-muted-foreground">
              값이 있으면 배경 이미지 대신 영상을 재생합니다. 이미지는
              poster(첫 프레임 대체)로 쓰입니다.
            </span>
          </label>
          <label className="a-check sm:col-span-2">
            <input
              type="checkbox"
              name="content_text_align"
              value="left"
              checked={hero.text_align === "left"}
              onChange={(e) =>
                setHero(
                  parseHeroContent({
                    ...hero,
                    text_align: e.target.checked ? "left" : "",
                  }),
                )
              }
            />
            카피를 왼쪽에 두기 — 인물 배너(오른쪽)와 맞출 때
          </label>
          <label className="a-check sm:col-span-2">
            <input
              type="checkbox"
              name="content_variant"
              value="bio"
              checked={hero.variant === "bio"}
              onChange={(e) =>
                setHero(
                  parseHeroContent({
                    ...hero,
                    variant: e.target.checked ? "bio" : "",
                    text_align: e.target.checked ? "left" : hero.text_align,
                  }),
                )
              }
            />
            약력(바이오) 레이아웃 — 배지·경력·안내 박스
          </label>
          {hero.variant === "bio" && (
            <>
              <label className="flex flex-col gap-1">
                <span className="a-label">직함 (이름 옆)</span>
                <input
                  name="content_role"
                  value={hero.role}
                  onChange={(e) =>
                    setHero(parseHeroContent({ ...hero, role: e.target.value }))
                  }
                  placeholder="예: 대표변호사"
                  className="a-input"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="a-label">배지 (| 로 여러 개)</span>
                <input
                  name="content_badges"
                  value={hero.badges}
                  onChange={(e) =>
                    setHero(
                      parseHeroContent({ ...hero, badges: e.target.value }),
                    )
                  }
                  placeholder="예: 형사재판센터|서울고등법원 재판연구원 출신"
                  className="a-input"
                />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="a-label">안내 박스</span>
                <input
                  name="content_info_box"
                  value={hero.info_box}
                  onChange={(e) =>
                    setHero(
                      parseHeroContent({ ...hero, info_box: e.target.value }),
                    )
                  }
                  placeholder="예: 구속·영장심사 당일 대응 · 가족 대리 상담 가능"
                  className="a-input"
                />
              </label>
              <label className="a-check sm:col-span-2">
                <input
                  type="checkbox"
                  name="content_density"
                  value="section"
                  checked={hero.density === "section"}
                  onChange={(e) =>
                    setHero(
                      parseHeroContent({
                        ...hero,
                        density: e.target.checked ? "section" : "",
                      }),
                    )
                  }
                />
                본문 블록 높이 — 홈 2번째처럼 풀스크린이 아닐 때
              </label>
              <div className="sm:col-span-2">
                <ItemListEditor
                  kind="hero"
                  items={items}
                  onChange={setItems}
                  folder={mediaFolder}
                />
              </div>
            </>
          )}
        </div>
      )}

      {kind === "cta" && (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="a-label">작은 제목 (위)</span>
              <input
                name="content_badge"
                value={cta.badge}
                onChange={(e) =>
                  setCta(parseCtaContent({ ...cta, badge: e.target.value }))
                }
                className="a-input"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="a-label">버튼 글자</span>
              <input
                name="content_button_label"
              placeholder="예: 지금 상담하기"
                value={cta.button_label}
                onChange={(e) =>
                  setCta(
                    parseCtaContent({ ...cta, button_label: e.target.value }),
                  )
                }
                className="a-input"
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
            <span className="a-label">동의 문구</span>
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
              className="a-input"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="a-label">제출 버튼</span>
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
              className="a-input"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="a-label">성공 메시지</span>
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
              className="a-input"
            />
          </label>
        </div>
      )}

      {kind === "page_link" && (
        <>
          <label className="a-check">
            <input type="checkbox" name="content_variant" value="story" />
            스크롤 스토리로 보이기 — 글은 고정, 항목 이미지가 스크롤에 따라 넘어감
          </label>
          <label className="flex flex-col gap-1">
            <span className="a-label">통계 한 줄</span>
            <input
              name="content_stats"
              placeholder="예: 무죄 4건, 항소심 원심 파기 3건. 전부 2026년 선고입니다."
              className="a-input"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="a-label">
              강조 구절{" "}
              <span style={{ color: "var(--a-ink-3)" }}>| 로 구분</span>
            </span>
            <input
              name="content_stats_marks"
              placeholder="예: 무죄 4건|항소심 원심 파기 3건"
              className="a-input"
            />
          </label>
          <ItemListEditor
            kind="page_link"
            items={items}
            onChange={setItems}
            folder={mediaFolder}
          />
        </>
      )}

      {kind === "youtube_gallery" && (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="a-label">더보기 버튼 글자</span>
              <input
                name="content_more_label"
                placeholder="예: 더보기 →"
                value={youtube.more_label}
                onChange={(e) =>
                  setYoutube(
                    parseYoutubeGalleryContent({
                      ...youtube,
                      more_label: e.target.value,
                    }),
                  )
                }
                className="a-input"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="a-label">더보기 링크</span>
              <input
                name="content_more_href"
                placeholder="예: https://www.youtube.com/@channel"
                value={youtube.more_href}
                onChange={(e) =>
                  setYoutube(
                    parseYoutubeGalleryContent({
                      ...youtube,
                      more_href: e.target.value,
                    }),
                  )
                }
                className="a-input"
              />
            </label>
          </div>
          <ItemListEditor
            kind="youtube_gallery"
            items={items}
            onChange={setItems}
            folder={mediaFolder}
          />
        </div>
      )}

      {kind === "news_room" && (
        <ItemListEditor
          kind="news_room"
          items={items}
          onChange={setItems}
          folder={mediaFolder}
        />
      )}

      {kind === "image_gallery" && (
        <ItemListEditor
          kind="image_gallery"
          items={items}
          onChange={setItems}
          folder={mediaFolder}
        />
      )}

      {kind === "client_reviews" && (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="a-label">하단 고지</span>
            <input
              name="content_note"
              value={reviews.note}
              onChange={(e) =>
                setReviews(
                  parseClientReviewsContent({
                    ...reviews,
                    note: e.target.value,
                  }),
                )
              }
              placeholder="예: 의뢰인 동의를 받아 게재했습니다."
              className="a-input"
            />
          </label>
          <ItemListEditor
            kind="client_reviews"
            items={items}
            onChange={setItems}
            folder={mediaFolder}
          />
        </div>
      )}

      {kind !== "page_link" &&
        kind !== "cta" &&
        kind !== "youtube_gallery" &&
        kind !== "news_room" &&
        kind !== "image_gallery" &&
        kind !== "client_reviews" &&
        !(kind === "hero" && hero.variant === "bio") && (
          <input type="hidden" name="items_json" value="[]" />
        )}

      {state.error && <p className="a-error">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="a-btn a-btn-primary self-start"
      >
        {pending ? "추가 중..." : "블록 추가"}
      </button>
    </form>
  );
}
