"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { canGoBack } from "@/lib/nav";

export default function TopBarMain() {
  const pathname = usePathname();
  const router = useRouter();
  const onMenuPage = pathname === "/menu";

  // 히스토리상 되돌아갈 화면이 있으면 뒤로가기, 없으면(메뉴로 직접 진입 등) 홈으로 보낸다.
  const handleBack = () => {
    if (canGoBack()) router.back();
    else router.push("/tickets");
  };

  return (
    <>
      <div className="h-[57px]" />
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-dashed border-line bg-white px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/remy-logo.svg"
          alt="REMY Performance Soccer"
          className="h-[27px] w-auto"
        />
        {onMenuPage ? (
          <button
            type="button"
            onClick={handleBack}
            aria-label="이전 화면으로"
            className="flex h-[38px] w-[38px] items-center justify-center gap-[3px] rounded-full border border-[#222222] bg-[#555555]"
          >
            <span className="h-[2px] w-[2px] bg-white" />
            <span className="h-[2px] w-[2px] bg-white" />
            <span className="h-[2px] w-[2px] bg-white" />
          </button>
        ) : (
          <Link
            href="/menu"
            aria-label="메뉴"
            className="flex h-[38px] w-[38px] items-center justify-center gap-[3px] rounded-full border border-[#222222] bg-[#555555]"
          >
            <span className="h-[2px] w-[2px] bg-white" />
            <span className="h-[2px] w-[2px] bg-white" />
            <span className="h-[2px] w-[2px] bg-white" />
          </Link>
        )}
      </header>
    </>
  );
}
