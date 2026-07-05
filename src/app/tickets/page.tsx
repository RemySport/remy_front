"use client";

import { useState } from "react";
import Link from "next/link";
import TopBarMain from "@/components/TopBarMain";
import BottomNav from "@/components/BottomNav";
import TogglePill from "@/components/TogglePill";
import MatchCard from "@/components/MatchCard";
import { CLUB_MATCHES, TOURNAMENT_MATCHES, TEAMS } from "@/lib/data";

const SUMMARY = [
  { next: "2026년 6월 8일 (월) - 원정 경기", available: "24 경기 +α", closed: "14 경기" },
  { next: "2026년 7월 10일 (금) - 홈 경기", available: "6 경기 +α", closed: "2 경기" },
] as const;

export default function TicketsPage() {
  const [tab, setTab] = useState<0 | 1>(0);
  const matches = tab === 0 ? CLUB_MATCHES : TOURNAMENT_MATCHES;
  const summary = SUMMARY[tab];

  return (
    <div className="pb-[130px]">
      <TopBarMain />

      <div className="relative overflow-hidden">
        {/* 워터마크 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/watermark-ball.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-[-13px] top-[100px] h-[201px] w-[215px]"
        />

        <div className="relative px-4">
          <div className="pt-6">
            <TogglePill
              options={["클럽리그", "토너먼트"]}
              value={tab}
              onChange={setTab}
            />
          </div>

          {/* 마이팀 */}
          <div className="mt-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-[6px]">
                <span className="h-[10px] w-[3px] bg-primary" />
                <span className="text-[10px] font-extrabold leading-[11px]">마이팀</span>
              </div>
              <h2 className="mt-[10px] text-lg font-extrabold leading-5">
                {TEAMS.barcelona.name}
              </h2>
            </div>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TEAMS.barcelona.logo}
                alt={TEAMS.barcelona.name}
                className="h-[60px] w-[60px] object-contain"
              />
              <Link
                href="/myteam"
                className="absolute -bottom-1 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[8px] font-black text-white"
              >
                변경
              </Link>
            </div>
          </div>

          {/* 요약 박스 */}
          <div className="mt-5 rounded-md border border-black bg-white">
            <div className="flex h-[50px] items-center justify-between px-4">
              <span className="text-xs text-soft">최근 예정경기</span>
              <span className="text-xs">
                <b className="font-black">{summary.next.split(" - ")[0]}</b>
                {" - "}
                {summary.next.split(" - ")[1]}
              </span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-black border-t border-black">
              <div className="flex h-[50px] items-center justify-between px-4">
                <span className="text-xs text-soft">예약가능 경기</span>
                <span className="text-xs font-extrabold">{summary.available}</span>
              </div>
              <div className="flex h-[50px] items-center justify-between px-4">
                <span className="text-xs text-soft">예약불가 경기</span>
                <span className="text-xs font-extrabold">{summary.closed}</span>
              </div>
            </div>
          </div>

          {/* 경기 목록 */}
          <div className="mt-10 space-y-5">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
