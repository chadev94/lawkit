"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 주소를 지오코딩해 카카오맵에 마커로 표시한다.
 * SDK는 마운트 시점에 지연 로드하고, 지오코딩이 성공해 컨테이너가
 * 실제 크기를 가진 뒤에 지도를 생성한다(숨김 상태 생성 시 타일이 깨진다).
 * 키가 없거나 지오코딩에 실패하면 아무것도 렌더하지 않는다.
 */

const APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

type KakaoMaps = {
  load: (cb: () => void) => void;
  LatLng: new (lat: number, lng: number) => unknown;
  Map: new (el: HTMLElement, opts: { center: unknown; level: number }) => unknown;
  Marker: new (opts: { map: unknown; position: unknown }) => unknown;
  services: {
    Geocoder: new () => {
      addressSearch: (
        addr: string,
        cb: (result: { x: string; y: string }[], status: string) => void,
      ) => void;
    };
    Status: { OK: string };
  };
};

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}

let sdkPromise: Promise<void> | null = null;

function loadSdk(appKey: string): Promise<void> {
  if (window.kakao?.maps) return Promise.resolve();
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
      script.onload = () => resolve();
      script.onerror = () => {
        sdkPromise = null;
        reject(new Error("카카오맵 SDK 로드 실패"));
      };
      document.head.appendChild(script);
    });
  }
  return sdkPromise;
}

/** 지오코딩용 주소 정규화. "(건물명)" 접미는 제거한다. */
function normalizeAddress(address: string): string {
  return address.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function KakaoMap({ address }: { address: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  useEffect(() => {
    const query = normalizeAddress(address);
    if (!APP_KEY || !query) return;

    let cancelled = false;

    loadSdk(APP_KEY)
      .then(() => {
        window.kakao!.maps.load(() => {
          if (cancelled) return;
          const { maps } = window.kakao!;
          new maps.services.Geocoder().addressSearch(query, (result, status) => {
            if (cancelled) return;
            if (status !== maps.services.Status.OK || !result[0]) return;
            setCoords({ lat: Number(result[0].y), lng: Number(result[0].x) });
          });
        });
      })
      .catch(() => {
        // SDK 로드 실패 시 지도 없이 조용히 넘어간다
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  useEffect(() => {
    if (!coords || !containerRef.current || !window.kakao?.maps) return;
    const { maps } = window.kakao;
    const center = new maps.LatLng(coords.lat, coords.lng);
    const map = new maps.Map(containerRef.current, { center, level: 3 });
    new maps.Marker({ map, position: center });
  }, [coords]);

  if (!coords) return null;

  return (
    <div
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded"
      style={{ border: "1px solid var(--border, #e4e4e7)" }}
    />
  );
}
