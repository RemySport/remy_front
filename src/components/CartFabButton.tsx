"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { CartIcon } from "./icons";

/**
 * 굿즈 화면(목록/상세)에서 장바구니로 이동하는 우상단 플로팅 버튼.
 * ScrollToTopButton과 같은 fixed 플로팅 버튼 패턴을 따르되, 여러 화면이 공유하는
 * TopBarMain/TopBarSub 헤더 컴포넌트는 건드리지 않아 영향 범위를 굿즈 화면으로 한정한다.
 */
export default function CartFabButton() {
  const { totalCount } = useCart();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto flex w-full max-w-[402px] justify-end px-4">
      <Link
        href="/cart"
        aria-label="장바구니"
        className="pointer-events-auto relative mt-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#222222] bg-black shadow-lg"
      >
        <CartIcon className="h-5 w-5 text-white" />
        {totalCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </Link>
    </div>
  );
}
