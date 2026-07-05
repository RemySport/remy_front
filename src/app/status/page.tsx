"use client";

import { useState } from "react";
import TopBarMain from "@/components/TopBarMain";
import BottomNav from "@/components/BottomNav";
import SectionTitle from "@/components/SectionTitle";
import TogglePill from "@/components/TogglePill";
import MatchCard from "@/components/MatchCard";
import { CLUB_MATCHES } from "@/lib/data";

export default function StatusPage() {
  const [tab, setTab] = useState<0 | 1>(0);

  return (
    <div className="pb-[130px]">
      <TopBarMain />

      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/watermark-ticket.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-[25px] top-[125px] h-[153px] w-[172px]"
        />

        <div className="relative px-4">
          <div className="pt-6">
            <TogglePill
              options={["예약티켓", "지난티켓"]}
              value={tab}
              onChange={setTab}
            />
          </div>

          <div className="mt-8">
            <SectionTitle
              label={tab === 0 ? "예약티켓" : "지난티켓"}
              title={tab === 0 ? "현재 예약된 티켓입니다." : "지난 티켓입니다."}
            />
          </div>

          {/* 요약 박스 */}
          <div className="mt-5 grid grid-cols-2 divide-x divide-black rounded-md border border-black bg-white">
            <div className="flex h-[50px] items-center justify-between px-4">
              <span className="text-xs text-soft">예약된 티켓</span>
              <span className="text-xs font-extrabold">2 장</span>
            </div>
            <div className="flex h-[50px] items-center justify-between px-4">
              <span className="text-xs text-soft">보류된 티켓</span>
              <span className="text-xs font-extrabold">1 장</span>
            </div>
          </div>

          <div className="mt-10 space-y-5">
            {CLUB_MATCHES.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="ticket" />
    </div>
  );
}
