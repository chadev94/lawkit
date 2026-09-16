"use client";

import { useState } from "react";
import { KakaoMap } from "@/components/site/kakao-map";

/**
 * 다음(카카오) 우편번호 서비스 기반 주소 입력.
 * 기본주소는 검색으로만 채워지고(readonly), 상세주소는 별도 입력한다.
 * 스크립트는 키·도메인 등록 없이 사용 가능하며, 버튼 클릭 시점에 지연 로드한다.
 * https://postcode.map.daum.net/guide
 */

const POSTCODE_SRC =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

type DaumPostcodeData = {
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
  zonecode: string;
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
      }) => { open: () => void };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadPostcodeScript(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = POSTCODE_SRC;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("우편번호 스크립트를 불러오지 못했습니다."));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export function AddressSearchInput({
  name,
  detailName,
  defaultValue,
  defaultDetail,
}: {
  name: string;
  detailName: string;
  defaultValue: string;
  defaultDetail: string;
}) {
  const [address, setAddress] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  async function openPostcode() {
    setError(null);
    try {
      await loadPostcodeScript();
      new window.daum!.Postcode({
        oncomplete: (data) => {
          const building = data.buildingName ? ` (${data.buildingName})` : "";
          setAddress(`${data.roadAddress}${building}`);
        },
      }).open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "주소 검색을 열지 못했습니다.");
    }
  }

  return (
    <>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="a-label">주소</span>
        <div className="flex gap-2">
          <input
            name={name}
            value={address}
            readOnly
            placeholder="주소 검색으로 입력하세요"
            className="a-input flex-1"
          />
          <button
            type="button"
            onClick={openPostcode}
            className="a-btn a-btn-default shrink-0"
          >
            주소 검색
          </button>
        </div>
        {error && <p className="a-error">{error}</p>}
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="a-label">상세주소</span>
        <input
          name={detailName}
          defaultValue={defaultDetail}
          placeholder="층·호수 등 (선택)"
          className="a-input"
        />
      </label>
      {address.trim() && (
        <div className="sm:col-span-2">
          <KakaoMap address={address} />
        </div>
      )}
    </>
  );
}
