import Link from "next/link";
import type { TicketSummary } from "@/lib/api/tickets";
import { formatKoreanDate, formatPrice, formatTime } from "@/lib/format";
import ImageWithFallback from "./ImageWithFallback";
import { ArrowRightIcon, ClockIcon, PinIcon } from "./icons";

function TeamCol({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="flex w-[88px] flex-col items-center gap-[10px]">
      <ImageWithFallback src={logo} alt={name} className="h-10 w-10 object-contain" />
      <span className="whitespace-nowrap text-[10px] leading-[11px]">{name}</span>
    </div>
  );
}

export default function MatchCard({ ticket }: { ticket: TicketSummary }) {
  const isOpen = ticket.status === "AVAILABLE";
  const stadiumLabel = ticket.stadium
    ? [ticket.stadium.name, ticket.stadium.city].filter(Boolean).join(", ")
    : "구장 미정";

  return (
    <article className="rounded-md border border-line bg-white px-[11px]">
      <div className="flex h-[45px] items-center justify-between">
        <span className="text-xs font-extrabold">{formatKoreanDate(ticket.date)}</span>
        <span className="text-xs">
          <b className="font-extrabold">{ticket.leagueName ?? "미분류"}</b> 리그
        </span>
      </div>

      <div className="border-t border-dashed border-line" />

      <div className="flex items-center justify-between py-[18px]">
        <TeamCol name={ticket.home?.name ?? "?"} logo={ticket.home?.logoUrl ?? null} />
        <div className="flex items-center gap-[10px]">
          <span className="text-xs font-bold">홈팀</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-[10px] font-black text-[#AAAAAA]">
            VS
          </span>
          <span className="text-xs font-bold">원정팀</span>
        </div>
        <TeamCol name={ticket.away?.name ?? "?"} logo={ticket.away?.logoUrl ?? null} />
      </div>

      <div className="border-t border-dashed border-line" />

      <div className="flex items-center justify-between py-[14px]">
        <div className="flex flex-col gap-[10px]">
          <span className="flex items-center gap-[7px] text-[10px] leading-[11px]">
            <PinIcon className="h-[13px] w-[10px] text-black" />
            {stadiumLabel}
          </span>
          <span className="flex items-center gap-[7px] text-[10px] leading-[11px]">
            <ClockIcon className="h-[10px] w-[10px] text-black" />
            {formatTime(ticket.date)} · {formatPrice(ticket.price)}
          </span>
        </div>
        {isOpen ? (
          <Link
            href={`/reserve?ticketId=${ticket.ticketId}`}
            className="flex h-10 w-[210px] items-center justify-center gap-4 rounded-md bg-primary text-xs font-bold text-white"
          >
            티켓 예약하기
            <ArrowRightIcon className="h-[13px] w-[14px] text-white" />
          </Link>
        ) : (
          <div className="flex h-10 w-[210px] items-center justify-center gap-4 rounded-md border border-line bg-white text-xs font-bold text-line">
            티켓 예약종료
            <ArrowRightIcon className="h-[13px] w-[14px] text-line" />
          </div>
        )}
      </div>
    </article>
  );
}
