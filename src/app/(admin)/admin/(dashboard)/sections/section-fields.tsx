"use client";

import { useId, useState } from "react";
import { mediaPublicUrl } from "@/lib/section-content";
import { uploadSectionMedia } from "@/lib/section-media";
import type { SectionItemInput } from "@/lib/section-content";

export type DraftItem = SectionItemInput & { key: string };

function newKey() {
  return crypto.randomUUID();
}

export function toDraftItems(
  items: SectionItemInput[] | undefined,
): DraftItem[] {
  return (items ?? []).map((item, index) => ({
    ...item,
    key: item.id ?? newKey(),
    sort_order: item.sort_order ?? index,
  }));
}

export function ImageField({
  label,
  name,
  value,
  folder,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  folder: string;
  onChange: (path: string) => void;
}) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = mediaPublicUrl(value);

  async function onFileChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const result = await uploadSectionMedia(folder, file);
    setUploading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onChange(result.path);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="a-label">{label}</span>
      <input type="hidden" name={name} value={value} />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="h-28 w-full rounded-[7px] object-cover"
        />
      )}
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className="a-btn a-btn-default a-btn-sm cursor-pointer"
        >
          {uploading ? "업로드 중..." : value ? "이미지 교체" : "이미지 업로드"}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => onFileChange(e.target.files?.[0])}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="a-btn a-btn-danger a-btn-sm"
          >
            제거
          </button>
        )}
      </div>
      {error && <p className="a-error">{error}</p>}
    </div>
  );
}

export function ItemListEditor({
  kind,
  items,
  onChange,
  folder,
}: {
  kind: "page_link" | "cta";
  items: DraftItem[];
  onChange: (items: DraftItem[]) => void;
  folder: string;
}) {
  function updateAt(index: number, patch: Partial<DraftItem>) {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([
      ...items,
      {
        key: newKey(),
        sort_order: items.length,
        title: "",
        subtitle: null,
        body: null,
        href: null,
        image_path: null,
        meta: kind === "cta" ? { step: 1 } : {},
        is_active: true,
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="a-label font-medium">
          {kind === "page_link" ? "카드 / 리스트 항목" : "선택지"}
        </p>
        <button
          type="button"
          onClick={addItem}
          className="a-btn a-btn-quiet a-btn-sm"
        >
          + 항목 추가
        </button>
      </div>

      {items.length === 0 && (
        <p className="a-empty px-3 py-4 text-xs">
          항목이 없습니다. 추가해 주세요.
        </p>
      )}

      {items.map((item, index) => (
        <div
          key={item.key}
          className="a-card flex flex-col gap-2 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="a-hint">#{index + 1}</span>
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="a-btn a-btn-danger a-btn-sm"
            >
              삭제
            </button>
          </div>

          <label className="flex flex-col gap-1">
            <span className="a-label">제목</span>
            <input
              value={item.title ?? ""}
              onChange={(e) => updateAt(index, { title: e.target.value })}
              className="a-input"
            />
          </label>

          {kind === "page_link" && (
            <>
              <label className="flex flex-col gap-1">
                <span className="a-label">부제</span>
                <input
                  value={item.subtitle ?? ""}
                  onChange={(e) =>
                    updateAt(index, { subtitle: e.target.value })
                  }
                  className="a-input"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="a-label">본문</span>
                <textarea
                  rows={2}
                  value={item.body ?? ""}
                  onChange={(e) => updateAt(index, { body: e.target.value })}
                  className="a-input"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="a-label">링크</span>
                <input
                  value={item.href ?? ""}
                  onChange={(e) => updateAt(index, { href: e.target.value })}
                  placeholder="/practice-areas"
                  className="a-input"
                />
              </label>
              <ImageField
                label="이미지"
                name={`item_image_${item.key}`}
                value={item.image_path ?? ""}
                folder={folder}
                onChange={(path) => updateAt(index, { image_path: path })}
              />
            </>
          )}
        </div>
      ))}

      <input
        type="hidden"
        name="items_json"
        value={JSON.stringify(
          items.map((item, index) => ({
            id: item.id,
            sort_order: index,
            title: item.title,
            subtitle: item.subtitle,
            body: item.body,
            href: item.href,
            image_path: item.image_path,
            meta: item.meta ?? {},
            is_active: item.is_active !== false,
          })),
        )}
      />
    </div>
  );
}
