"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBarSub from "@/components/TopBarSub";
import SectionTitle from "@/components/SectionTitle";
import BottomCTA from "@/components/BottomCTA";
import ImageWithFallback from "@/components/ImageWithFallback";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { getLeagues, getTeams, type LeagueResponse, type TeamResponse } from "@/lib/api/teams";
import { getMyTeam, setMyTeam as apiSetMyTeam } from "@/lib/api/user";
import { ApiError } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

export default function MyTeamPage() {
  const status = useRequireAuth();
  const router = useRouter();

  const [leagues, setLeagues] = useState<LeagueResponse[]>([]);
  const [leagueId, setLeagueId] = useState<number | null>(null);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [selectedTeamLogo, setSelectedTeamLogo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeagues()
      .then((res) => {
        setLeagues(res);
        if (res.length > 0) setLeagueId(res[0].leagueId);
      })
      .catch(() => setLeagues([]));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    getMyTeam()
      .then((mt) => {
        if (mt) {
          setSelectedTeamId(mt.teamId);
          setSelectedTeamName(mt.teamName);
          setSelectedTeamLogo(mt.logoUrl);
        }
      })
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    if (leagueId == null) return;
    getTeams(leagueId)
      .then(setTeams)
      .catch(() => setTeams([]));
  }, [leagueId]);

  if (status !== "authenticated") return null;

  const handleSelect = (team: TeamResponse) => {
    if (selectedTeamId === team.teamId) {
      setSelectedTeamId(null);
      setSelectedTeamName(null);
      setSelectedTeamLogo(null);
    } else {
      setSelectedTeamId(team.teamId);
      setSelectedTeamName(team.name);
      setSelectedTeamLogo(team.logoUrl);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTeamId) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiSetMyTeam(selectedTeamId);
      router.replace("/tickets");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "마이팀 설정 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-[130px]">
      <TopBarSub title="마이팀 설정" icon="back" href="/tickets" />

      <section className="flex items-start justify-between gap-3 px-4 pt-7">
        <SectionTitle
          label="마이팀 설정"
          title={"내가 응원하는 팀을\n마이팀으로 선택해주세요."}
        />

        {/* 선택된 팀 표시 */}
        <div className="relative mt-2 h-[60px] w-[90px] shrink-0 rounded-md border border-line bg-white">
          {selectedTeamName ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 overflow-hidden pl-2 pr-1">
              <ImageWithFallback
                src={selectedTeamLogo}
                alt={selectedTeamName}
                className="h-[30px] w-[30px] shrink-0 object-contain"
              />
              <span className="line-clamp-2 break-words text-center text-[8px] font-bold leading-[9px]">
                {selectedTeamName}
              </span>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center pl-2">
              <span className="text-[8px] font-bold text-soft">미선택</span>
            </div>
          )}
          <span className="absolute -left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black text-[8px] font-black text-white">
            선택
          </span>
        </div>
      </section>

      <div className="mx-4 mt-7 border-t border-line" />

      {/* 리그선택 */}
      <section className="pt-6">
        <p className="mb-[12px] px-[27px] text-[8px] font-bold leading-[9px]">
          리그선택 <span className="text-soft">(필수)</span>
        </p>
        <div className="scrollbar-none flex gap-[10px] overflow-x-auto px-[27px] pb-1 [scrollbar-width:none]">
          {leagues.map((l) => (
            <button
              key={l.leagueId}
              type="button"
              onClick={() => setLeagueId(l.leagueId)}
              className={`h-[34px] shrink-0 whitespace-nowrap rounded-full px-6 text-xs font-bold ${
                leagueId === l.leagueId
                  ? "bg-primary text-white"
                  : "border border-line bg-white text-black"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </section>

      {/* 팀 목록 */}
      <section className="mt-4 px-[27px]">
        {teams.length === 0 && <p className="py-8 text-center text-xs text-soft">팀 목록이 없습니다.</p>}
        {teams.map((team) => {
          const isSelected = selectedTeamId === team.teamId;
          return (
            <button
              key={team.teamId}
              type="button"
              onClick={() => handleSelect(team)}
              className="flex w-full items-center gap-5 border-b border-line py-4 text-left last:border-b-0"
            >
              <ImageWithFallback
                src={team.logoUrl}
                alt={team.name}
                className={`h-12 w-12 shrink-0 object-contain ${isSelected ? "opacity-30" : ""}`}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={`block break-words text-xs font-bold leading-[15px] ${
                    isSelected ? "text-line" : "text-black"
                  }`}
                >
                  {team.name}
                </span>
                <span
                  className={`mt-[6px] block break-words text-[8px] font-bold leading-[11px] ${
                    isSelected ? "text-[#EEEEEE]" : "text-soft"
                  }`}
                >
                  {team.leagueName ?? ""}
                </span>
              </span>
              <span
                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full ${
                  isSelected ? "bg-black" : "bg-soft"
                }`}
              >
                {isSelected ? (
                  <MinusIcon className="h-[2px] w-3 text-white" />
                ) : (
                  <PlusIcon className="h-3 w-3 text-white" />
                )}
              </span>
            </button>
          );
        })}
        {error && <p className="mt-4 text-xs font-bold text-primary">{error}</p>}
      </section>

      <BottomCTA
        label={submitting ? "등록 중..." : "선택등록"}
        onClick={handleSubmit}
        disabled={!selectedTeamId || submitting}
      />
    </div>
  );
}
