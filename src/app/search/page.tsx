"use client";

import { useEffect, useState } from "react";
import TopBarMain from "@/components/TopBarMain";
import BottomNav from "@/components/BottomNav";
import SectionTitle from "@/components/SectionTitle";
import MatchCard from "@/components/MatchCard";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { ArrowDownIcon } from "@/components/icons";
import { getLeagues, getTeams, type LeagueResponse, type TeamResponse } from "@/lib/api/teams";
import { getTickets, type TicketSummary } from "@/lib/api/tickets";
import { ApiError } from "@/lib/api/client";

export default function SearchPage() {
  const [leagues, setLeagues] = useState<LeagueResponse[]>([]);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [leagueId, setLeagueId] = useState<number | "">("");
  const [teamId, setTeamId] = useState<number | "">("");
  const [tickets, setTickets] = useState<TicketSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeagues()
      .then(setLeagues)
      .catch(() => setLeagues([]));
  }, []);

  useEffect(() => {
    Promise.resolve()
      .then(() => {
        setTeamId("");
        return getTeams(leagueId === "" ? undefined : leagueId);
      })
      .then(setTeams)
      .catch(() => setTeams([]));
  }, [leagueId]);

  useEffect(() => {
    const selectedTeam = teams.find((t) => t.teamId === teamId);
    getTickets(selectedTeam ? { keyword: selectedTeam.name } : {})
      .then((res) => setTickets(res.tickets))
      .catch((e) => setError(e instanceof ApiError ? e.message : "검색 결과를 불러오지 못했습니다."));
  }, [teamId, teams]);

  return (
    <div className="pb-[130px]">
      <TopBarMain />

      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/watermark-search.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-[110px] top-[10px] h-[136px] w-[136px]"
        />

        <div className="relative px-4">
          <div className="pt-7">
            <SectionTitle label="경기 검색" title="리그와 팀을 선택하세요." />
          </div>

          {/* 리그/팀 선택 */}
          <div className="mt-6 flex items-center gap-5 px-[11px]">
            <div className="flex-1">
              <p className="mb-[10px] text-[8px] font-bold leading-[9px]">리그 선택</p>
              <div className="relative">
                <select
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="h-[50px] w-full appearance-none border border-black bg-white px-4 text-xs font-extrabold"
                >
                  <option value="">전체보기</option>
                  {leagues.map((l) => (
                    <option key={l.leagueId} value={l.leagueId}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <ArrowDownIcon className="pointer-events-none absolute right-4 top-1/2 h-[15px] w-[14px] -translate-y-1/2 text-black" />
              </div>
            </div>
            <div className="flex-1">
              <p className="mb-[10px] text-[8px] font-bold leading-[9px]">팀 선택</p>
              <div className="relative">
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="h-[50px] w-full appearance-none border border-black bg-white px-4 text-xs font-extrabold"
                >
                  <option value="">전체보기</option>
                  {teams.map((t) => (
                    <option key={t.teamId} value={t.teamId}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ArrowDownIcon className="pointer-events-none absolute right-4 top-1/2 h-[15px] w-[14px] -translate-y-1/2 text-black" />
              </div>
            </div>
          </div>

          <div className="my-7 border-t border-line" />

          <div className="space-y-5">
            {error && <p className="text-center text-xs text-soft">{error}</p>}
            {!error && tickets === null && <p className="text-center text-xs text-soft">불러오는 중...</p>}
            {!error && tickets !== null && tickets.length === 0 && (
              <p className="text-center text-xs text-soft">검색 결과가 없습니다.</p>
            )}
            {(tickets ?? []).map((t) => (
              <MatchCard key={t.ticketId} ticket={t} />
            ))}
          </div>
        </div>
      </div>

      <ScrollToTopButton />
      <BottomNav active="search" />
    </div>
  );
}
