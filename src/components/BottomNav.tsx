"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { CartIcon, GridIcon, HomeIcon, SearchIcon, TicketNavIcon } from "./icons";

const ITEMS = [
  { key: "home", href: "/tickets", label: "홈", Icon: HomeIcon, size: "h-5 w-5" },
  { key: "search", href: "/search", label: "검색", Icon: SearchIcon, size: "h-5 w-5" },
  { key: "ticket", href: "/status", label: "티켓", Icon: TicketNavIcon, size: "h-[25px] w-[25px]" },
  { key: "goods", href: "/goods", label: "굿즈", Icon: GridIcon, size: "h-5 w-5" },
] as const;

export type NavKey = (typeof ITEMS)[number]["key"];

/**
 * `active` 를 비우면 어떤 탭도 강조하지 않는다 (예: 우상단 ...으로 진입하는 메뉴 페이지).
 * `showCart` 는 굿즈 화면처럼 장바구니 접근이 필요한 곳에서만 켠다. 필 바깥 우상단에
 * 독립된 미니 버튼으로 붙여, 네 개 탭의 활성 상태 로직과는 분리해 둔다.
 */
export default function BottomNav({ active, showCart }: { active?: NavKey; showCart?: boolean }) {
  const { totalCount } = useCart();

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div className="relative flex h-16 w-[220px] items-center justify-evenly rounded-full bg-black">
        {ITEMS.map(({ key, href, label, Icon, size }) => (
          <Link
            key={key}
            href={href}
            aria-label={label}
            className={`flex h-[52px] w-[52px] items-center justify-center rounded-full ${
              active === key ? "bg-[#252525] text-white" : "text-[#555555]"
            }`}
          >
            <Icon className={size} />
          </Link>
        ))}

        {showCart && (
          <Link
            href="/cart"
            aria-label="장바구니"
            className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full border border-[#222222] bg-black shadow-lg"
          >
            <CartIcon className="h-4 w-4 text-white" />
            {totalCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </nav>
  );
}
