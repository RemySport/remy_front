"use client";

import { useEffect } from "react";
import { BackIcon } from "./icons";

/**
 * 회원가입 하단 "전체보기"로 열리는 약관 전문 뷰어.
 * Figma "이용약관"/"개인정보처리" 프레임처럼 별도 풀스크린으로 뜨지만,
 * 라우트 이동 없이 signup 페이지 위에 오버레이로 띄운다.
 */
export default function TermsModal({
  title,
  content,
  onClose,
}: {
  title: string;
  content: string;
  onClose: () => void;
}) {
  // 뒤 배경(가입 폼) 스크롤이 함께 움직이지 않도록 막는다.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-[402px] flex-col bg-white">
      <header className="relative flex h-16 shrink-0 items-center border-b border-dashed border-line px-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="뒤로가기"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-black bg-white"
        >
          <BackIcon className="h-[14px] w-[15px] text-black" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-extrabold">{title}</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-7">
        <p className="whitespace-pre-line text-[11px] leading-[19px] text-black">{content}</p>
      </div>
    </div>
  );
}
