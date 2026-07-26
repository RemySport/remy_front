"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { canGoBack } from "@/lib/nav";
import { BackIcon, XIcon } from "./icons";

export default function TopBarSub({
  title,
  icon,
  href,
}: {
  title: string;
  icon: "back" | "x";
  href: string;
}) {
  const router = useRouter();

  // 히스토리상 실제로 되돌아갈 화면이 있으면 진짜 뒤로가기를, 없으면(직접 URL 진입 등) href 로 이동한다.
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (canGoBack()) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <>
      <div className="h-[57px]" />
      <header className="relative flex h-16 items-center border-b border-dashed border-line px-4">
        <Link
          href={href}
          onClick={handleClick}
          aria-label={icon === "back" ? "뒤로가기" : "닫기"}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-black bg-white"
        >
          {icon === "back" ? (
            <BackIcon className="h-[14px] w-[15px] text-black" />
          ) : (
            <XIcon className="h-[11px] w-[11px] text-black" />
          )}
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-extrabold">
          {title}
        </h1>
      </header>
    </>
  );
}
