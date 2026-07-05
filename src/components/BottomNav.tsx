import Link from "next/link";
import { GridIcon, HomeIcon, SearchIcon, TicketNavIcon } from "./icons";

const ITEMS = [
  { key: "home", href: "/tickets", label: "홈", Icon: HomeIcon, size: "h-5 w-5" },
  { key: "search", href: "/search", label: "검색", Icon: SearchIcon, size: "h-5 w-5" },
  { key: "ticket", href: "/status", label: "티켓", Icon: TicketNavIcon, size: "h-[25px] w-[25px]" },
  { key: "grid", href: "/myteam", label: "메뉴", Icon: GridIcon, size: "h-5 w-5" },
] as const;

export type NavKey = (typeof ITEMS)[number]["key"];

export default function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div className="flex h-16 w-[220px] items-center justify-evenly rounded-full bg-black">
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
      </div>
    </nav>
  );
}
