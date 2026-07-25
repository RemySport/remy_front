"use client";

import { useEffect, useState } from "react";
import { ArrowDownIcon } from "./icons";

/**
 * 우측 하단 "맨 위로" 버튼.
 * 하단 네비(가운데 고정)와 겹치지 않도록, 레이아웃과 같은 max-w 컨테이너 안에서 우측 정렬한다.
 */
export default function ScrollToTopButton({ threshold = 400 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[402px] justify-end px-4">
      <button
        type="button"
        aria-label="맨 위로"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`mb-[96px] flex h-11 w-11 items-center justify-center rounded-full border border-[#222222] bg-black shadow-lg transition-opacity duration-200 ${
          visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ArrowDownIcon className="h-[15px] w-[14px] rotate-180 text-white" />
      </button>
    </div>
  );
}
