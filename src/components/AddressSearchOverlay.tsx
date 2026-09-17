"use client";

import { useEffect, useRef, useState } from "react";
import { BackIcon } from "./icons";
import { embedDaumPostcode, loadDaumPostcodeScript, type DaumPostcodeResult } from "@/lib/daumPostcode";

/**
 * 배송지 검색(우편번호+주소) 전용 풀스크린 오버레이.
 * Figma "굿즈 확정하기"의 "검색" 버튼에서 열리며, 카카오(다음) 우편번호 서비스를 그대로 붙여 쓴다.
 * 라우트 이동 없이 오버레이로 띄우는 이유는 TermsModal과 동일 — 체크아웃 중간 상태(주문 요약,
 * 이미 입력한 배송지 값 등)를 페이지 이동으로 날리지 않기 위함이다.
 */
export default function AddressSearchOverlay({
  onComplete,
  onClose,
}: {
  onComplete: (result: DaumPostcodeResult) => void;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let cancelled = false;

    loadDaumPostcodeScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        embedDaumPostcode(containerRef.current, (result) => onCompleteRef.current(result));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "우편번호 서비스를 불러오지 못했습니다."));

    return () => {
      cancelled = true;
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-[402px] flex-col bg-white">
      <header className="relative flex h-16 shrink-0 items-center border-b border-dashed border-line px-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-black bg-white"
        >
          <BackIcon className="h-[14px] w-[15px] text-black" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-extrabold">주소 검색</h1>
      </header>

      <div className="relative flex-1">
        {error && <p className="px-4 py-10 text-center text-xs text-soft">{error}</p>}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
