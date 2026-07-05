import TopBarMain from "@/components/TopBarMain";
import BottomNav from "@/components/BottomNav";
import SectionTitle from "@/components/SectionTitle";
import MatchCard from "@/components/MatchCard";
import { ArrowDownIcon } from "@/components/icons";
import { CLUB_MATCHES } from "@/lib/data";

export default function SearchPage() {
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
              <button
                type="button"
                className="flex h-[50px] w-full items-center justify-between border border-black bg-white px-4 text-xs font-extrabold"
              >
                전체보기
                <ArrowDownIcon className="h-[15px] w-[14px] text-black" />
              </button>
            </div>
            <div className="flex-1">
              <p className="mb-[10px] text-[8px] font-bold leading-[9px]">팀 선택</p>
              <button
                type="button"
                className="flex h-[50px] w-full items-center justify-between border border-black bg-white px-4 text-xs font-extrabold"
              >
                전체보기
                <ArrowDownIcon className="h-[15px] w-[14px] text-black" />
              </button>
            </div>
          </div>

          <div className="my-7 border-t border-line" />

          <div className="space-y-5">
            {CLUB_MATCHES.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="search" />
    </div>
  );
}
