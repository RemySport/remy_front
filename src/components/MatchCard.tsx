import Link from "next/link";
import type { Match } from "@/lib/data";
import { ArrowRightIcon, ClockIcon, PinIcon } from "./icons";

function TeamCol({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="flex w-[88px] flex-col items-center gap-[10px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt={name} className="h-10 w-10 object-contain" />
      <span className="whitespace-nowrap text-[10px] leading-[11px]">{name}</span>
    </div>
  );
}

export default function MatchCard({ match }: { match: Match }) {
  return (
    <article className="rounded-md border border-line bg-white px-[11px]">
      <div className="flex h-[45px] items-center justify-between">
        <span className="text-xs font-extrabold">{match.date}</span>
        <span className="text-xs">
          <b className="font-extrabold">{match.league}</b> 리그
        </span>
      </div>

      <div className="border-t border-dashed border-line" />

      <div className="flex items-center justify-between py-[18px]">
        <TeamCol name={match.home.name} logo={match.home.logo} />
        <div className="flex items-center gap-[10px]">
          <span className="text-xs font-bold">홈팀</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-[10px] font-black text-[#AAAAAA]">
            VS
          </span>
          <span className="text-xs font-bold">원정팀</span>
        </div>
        <TeamCol name={match.away.name} logo={match.away.logo} />
      </div>

      <div className="border-t border-dashed border-line" />

      <div className="flex items-center justify-between py-[14px]">
        <div className="flex flex-col gap-[10px]">
          <span className="flex items-center gap-[7px] text-[10px] leading-[11px]">
            <PinIcon className="h-[13px] w-[10px] text-black" />
            {match.stadium}
          </span>
          <span className="flex items-center gap-[7px] text-[10px] leading-[11px]">
            <ClockIcon className="h-[10px] w-[10px] text-black" />
            {match.time}
          </span>
        </div>
        {match.open ? (
          <Link
            href="/reserve"
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
