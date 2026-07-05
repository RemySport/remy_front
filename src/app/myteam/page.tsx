"use client";

import { useState } from "react";
import TopBarSub from "@/components/TopBarSub";
import SectionTitle from "@/components/SectionTitle";
import BottomCTA from "@/components/BottomCTA";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { TEAMS } from "@/lib/data";

const LEAGUES = ["추천", "프리머어", "라리가", "세이에A", "분데스리가"];

const TEAM_LIST = [
  TEAMS.arsenal,
  TEAMS.manutd,
  TEAMS.barcelona,
  TEAMS.realmadrid,
  TEAMS.acmilan,
  TEAMS.juventus,
];

export default function MyTeamPage() {
  const [league, setLeague] = useState("추천");
  const [selected, setSelected] = useState<string | null>(TEAMS.barcelona.name);
  const selectedTeam = TEAM_LIST.find((t) => t.name === selected);

  return (
    <div className="pb-[130px]">
      <TopBarSub title="마이팀 설정" icon="back" href="/tickets" />

      <section className="flex items-start justify-between px-4 pt-7">
        <SectionTitle
          label="마이팀 설정"
          title={"내가 응원하는 팀을\n마이팀으로 선택해주세요."}
        />

        {/* 선택된 팀 표시 */}
        <div className="relative mt-2 h-[60px] w-[90px] shrink-0 rounded-md border border-line bg-white">
          {selectedTeam ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 pl-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedTeam.logo}
                alt={selectedTeam.name}
                className="h-[30px] w-[30px] object-contain"
              />
              <span className="text-[8px] font-bold leading-[9px]">
                {selectedTeam.name}
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
          {LEAGUES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setLeague(name)}
              className={`h-[34px] shrink-0 whitespace-nowrap rounded-full px-6 text-xs font-bold ${
                league === name
                  ? "bg-primary text-white"
                  : "border border-line bg-white text-black"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      {/* 팀 목록 */}
      <section className="mt-4 px-[27px]">
        {TEAM_LIST.map((team) => {
          const isSelected = selected === team.name;
          return (
            <button
              key={team.name}
              type="button"
              onClick={() => setSelected(isSelected ? null : team.name)}
              className="flex w-full items-center gap-5 border-b border-line py-4 text-left last:border-b-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={team.logo}
                alt={team.name}
                className={`h-12 w-12 object-contain ${isSelected ? "opacity-30" : ""}`}
              />
              <span className="flex-1">
                <span
                  className={`block text-xs font-bold leading-[13px] ${
                    isSelected ? "text-line" : "text-black"
                  }`}
                >
                  {team.name}
                </span>
                <span
                  className={`mt-[6px] block text-[8px] font-bold leading-[9px] ${
                    isSelected ? "text-[#EEEEEE]" : "text-soft"
                  }`}
                >
                  {team.league}
                </span>
              </span>
              <span
                className={`flex h-[30px] w-[30px] items-center justify-center rounded-full ${
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
      </section>

      <BottomCTA label="선택등록" href="/tickets" />
    </div>
  );
}
