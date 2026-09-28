"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChannelLogo } from "@/components/site/channel-logo";
import {
  CHANNEL_META,
  channelUrlError,
  normalizeChannelUrl,
  type SiteChannel,
} from "@/lib/site-channels";

/**
 * 채널 목록 편집. 페이지·블록 목록과 같은 격자(⠿ 순서 · 로고 · 이름+주소 · 노출 배지).
 * 값은 channels_json 숨은 칸 하나로 폼에 실린다. 주소 칸 이름은 channel_url_<key>
 * 라 폼의 포커스 감지가 미리보기 로고를 찾는다(channels.<key>).
 */
export function ChannelsEditor({
  initial,
  /** 배지·드래그처럼 input 이벤트가 없는 변경 뒤에 폼이 초안을 다시 읽게 알린다 */
  onChange,
}: {
  initial: SiteChannel[];
  onChange?: () => void;
}) {
  const [items, setItems] = useState<SiteChannel[]>(initial);
  // dnd-kit 이 만드는 aria id 가 서버·클라이언트에서 같도록 고정한다(hydration 경고 방지).
  const dndId = useId();
  // 부모의 콜백은 렌더마다 새로 만들어지므로 ref 로 최신 것만 들고 있는다(효과 안에서 갱신).
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const first = useRef(true);

  // 숨은 칸(channels_json)의 값이 새로 그려진 뒤에 알린다. 그 전에 읽으면 이전 값이다.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChangeRef.current?.();
  }, [items]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const from = prev.findIndex((c) => c.key === active.id);
      const to = prev.findIndex((c) => c.key === over.id);
      return arrayMove(prev, from, to);
    });
  }, []);

  function update(key: SiteChannel["key"], patch: Partial<SiteChannel>) {
    setItems((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  }

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((c) => c.key)} strategy={verticalListSortingStrategy}>
        <ul className="a-list">
          {items.map((channel, index) => (
            <ChannelRow
              key={channel.key}
              channel={channel}
              position={index}
              onUrl={(url) => update(channel.key, { url })}
              onToggle={() => update(channel.key, { enabled: !channel.enabled })}
            />
          ))}
        </ul>
      </SortableContext>
      {/* 서버로 가는 값. 주소는 https 를 붙여 정리한 것 */}
      <input
        type="hidden"
        name="channels_json"
        value={JSON.stringify(
          items.map((c) => ({ key: c.key, url: normalizeChannelUrl(c.url), enabled: c.enabled })),
        )}
      />
    </DndContext>
  );
}

function ChannelRow({
  channel,
  position,
  onUrl,
  onToggle,
}: {
  channel: SiteChannel;
  position: number;
  onUrl: (url: string) => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: channel.key });
  const meta = CHANNEL_META[channel.key];
  const normalized = normalizeChannelUrl(channel.url);
  const error = channelUrlError(channel.key, normalized);
  const inputId = `channel-url-${channel.key}`;

  return (
    <li
      ref={setNodeRef}
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div className="a-row a-row-channel" data-off={!channel.enabled || undefined}>
        <span className="a-row-ord">
          <button
            type="button"
            className="a-drag"
            aria-label={`${meta.label} 순서 이동`}
            {...attributes}
            {...listeners}
          >
            ⠿
          </button>
          <span>{position + 1}</span>
        </span>

        <span className="a-channel-logo" aria-hidden="true">
          <ChannelLogo channel={channel.key} />
        </span>

        <div className="min-w-0">
          <label htmlFor={inputId} className="a-row-name">
            {meta.label}
          </label>
          <div className="a-channel-url">
            <input
              id={inputId}
              name={`channel_url_${channel.key}`}
              value={channel.url}
              onChange={(e) => onUrl(e.target.value)}
              placeholder={meta.placeholder}
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${inputId}-error` : undefined}
              className="a-input"
            />
            {error ? (
              <span id={`${inputId}-error`} className="a-field-error">
                {error}
              </span>
            ) : normalized ? (
              <span className="a-hint" style={{ color: "var(--a-ok)" }}>
                확인됨
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={`a-badge ${channel.enabled ? "a-badge-ok" : "a-badge-off"}`}
          aria-pressed={channel.enabled}
          title={channel.enabled ? "누르면 숨깁니다" : "누르면 사이트에 보입니다"}
        >
          {channel.enabled ? "노출중" : "숨김"}
        </button>
      </div>
    </li>
  );
}
