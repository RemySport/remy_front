"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TopBarMain from "@/components/TopBarMain";
import BottomNav from "@/components/BottomNav";
import TogglePill from "@/components/TogglePill";
import MatchCard from "@/components/MatchCard";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getTickets, type TicketSummary } from "@/lib/api/tickets";
import { getMyTeam, type MyTeamResponse } from "@/lib/api/user";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";

export default function TicketsPage() {
  const { status } = useAuth();
  const [tab, setTab] = useState<0 | 1>(0);
  const [tickets, setTickets] = useState<TicketSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myTeam, setMyTeam] = useState<MyTeamResponse>(null);

  useEffect(() => {
    getTickets({ size: 50 })
      .then((res) => setTickets(res.tickets))
      .catch((e) => setError(e instanceof ApiError ? e.message : "티켓 목록을 불러오지 못했습니다."));
  }, []);

  useEffect(() => {
    Promise.resolve()
      .then(() => (status === "authenticated" ? getMyTeam() : null))
      .then(setMyTeam)
      .catch(() => setMyTeam(null));
  }, [status]);

  const clubMatches = useMemo(
    () => (tickets ?? []).filter((t) => t.competitionType !== "TOURNAMENT"),
    [tickets]
  );
  const tournamentMatches = useMemo(
    () => (tickets ?? []).filter((t) => t.competitionType === "TOURNAMENT"),
    [tickets]
  );
  const matches = tab === 0 ? clubMatches : tournamentMatches;

  const availableCount = matches.filter((m) => m.status === "AVAILABLE").length;
  const closedCount = matches.length - availableCount;

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
            <TogglePill options={["클럽리그", "토너먼트"]} value={tab} onChange={setTab} />
          </div>

          {/* 마이팀 */}
          <div className="mt-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-[6px]">
                <span className="h-[10px] w-[3px] bg-primary" />
                <span className="text-[10px] font-extrabold leading-[11px]">마이팀</span>
              </div>
              <h2 className="mt-[10px] text-lg font-extrabold leading-5">
                {status === "authenticated" ? (myTeam ? myTeam.teamName : "미선택") : "로그인이 필요해요"}
              </h2>
            </div>
            <div className="relative">
              <ImageWithFallback
                src={myTeam?.logoUrl}
                alt={myTeam?.teamName ?? ""}
                className="h-[60px] w-[60px] object-contain"
              />
              <Link
                href={status === "authenticated" ? "/myteam" : "/login"}
                className="absolute -bottom-1 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[8px] font-black text-white"
              >
                변경
              </Link>
            </div>
          </div>

          {/* 요약 박스 */}
          <div className="mt-5 rounded-md border border-black bg-white">
            <div className="flex h-[50px] items-center justify-between px-4">
              <span className="text-xs text-soft">{tab === 0 ? "클럽리그" : "토너먼트"} 경기</span>
              <span className="text-xs font-extrabold">{matches.length} 경기</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-black border-t border-black">
              <div className="flex h-[50px] items-center justify-between px-4">
                <span className="text-xs text-soft">예약가능 경기</span>
                <span className="text-xs font-extrabold">{availableCount} 경기</span>
              </div>
              <div className="flex h-[50px] items-center justify-between px-4">
                <span className="text-xs text-soft">예약불가 경기</span>
                <span className="text-xs font-extrabold">{closedCount} 경기</span>
              </div>
            </div>
          </div>

          {/* 경기 목록 */}
          <div className="mt-10 space-y-5">
            {error && <p className="text-center text-xs text-soft">{error}</p>}
            {!error && tickets === null && <p className="text-center text-xs text-soft">불러오는 중...</p>}
            {!error && tickets !== null && matches.length === 0 && (
              <p className="text-center text-xs text-soft">표시할 경기가 없습니다.</p>
            )}
            {matches.map((m) => (
              <MatchCard key={m.ticketId} ticket={m} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
