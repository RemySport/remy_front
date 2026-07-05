import TopBarSub from "@/components/TopBarSub";
import BottomCTA from "@/components/BottomCTA";
import { ArrowDownIcon } from "@/components/icons";
import { TEAMS } from "@/lib/data";

function DetailItem({
  icon,
  iconClass,
  text,
  sub,
}: {
  icon: string;
  iconClass: string;
  text: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-[13px]">
      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded border border-line bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" className={iconClass} />
      </span>
      <span className="text-[10px] leading-[11px]">
        {text}
        {sub && <span className="text-soft"> {sub}</span>}
      </span>
    </div>
  );
}

export default function ReservePage() {
  return (
    <div className="pb-[130px]">
      <TopBarSub title="티켓 예약하기" icon="back" href="/tickets" />

      <section className="flex items-start justify-between px-4 pt-7">
        <div>
          <div className="flex items-center gap-[6px]">
            <span className="h-[10px] w-[3px] bg-primary" />
            <span className="text-[10px] font-extrabold leading-[11px]">라리가 리그</span>
          </div>
          <h2 className="mt-[10px] text-lg font-extrabold leading-[23px]">
            FC 바르셀로나 <span className="text-sm">VS</span>
            <br />
            아틀레티코 마드리드
          </h2>
        </div>

        {/* 홈/원정 팀 박스 */}
        <div className="relative mt-2 h-[60px] w-[140px] shrink-0 rounded-md border border-line bg-white">
          <span className="absolute left-1/2 top-1/2 h-[68px] w-px -translate-x-1/2 -translate-y-1/2 rotate-[16deg] bg-[#D9D9D9]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TEAMS.barcelona.logo}
            alt={TEAMS.barcelona.name}
            className="absolute left-[15px] top-[6px] h-[30px] w-[30px] object-contain"
          />
          <span className="absolute bottom-[6px] left-[21px] text-[8px] font-bold leading-[9px]">
            홈 팀
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TEAMS.atletico.logo}
            alt={TEAMS.atletico.name}
            className="absolute right-[15px] top-[6px] h-[30px] w-[30px] object-contain"
          />
          <span className="absolute bottom-[6px] right-[17px] text-[8px] font-bold leading-[9px]">
            원정 팀
          </span>
          <span className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-[8px] font-black text-white">
            VS
          </span>
        </div>
      </section>

      <div className="mx-4 mt-7 border-t border-line" />

      {/* 구매옵션 */}
      <section className="px-[27px] pt-6">
        <p className="mb-[10px] text-[8px] font-bold leading-[9px]">
          구매옵션 <span className="text-soft">(필수)</span>
        </p>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex h-[50px] w-[164px] items-center justify-between border border-black bg-white px-4 text-xs font-extrabold"
          >
            수량 <span className="font-normal text-soft">(선택)</span>
            <ArrowDownIcon className="ml-auto h-[15px] w-[14px] pl-0 text-black" />
          </button>
          <button
            type="button"
            className="flex h-[50px] w-[164px] items-center justify-between border border-black bg-white px-4 text-xs font-extrabold"
          >
            수령방법 <span className="font-normal text-soft">(선택)</span>
            <ArrowDownIcon className="ml-auto h-[15px] w-[14px] text-black" />
          </button>
        </div>
      </section>

      <div className="mx-4 mt-7 border-t border-line" />

      {/* 상세정보 */}
      <section className="px-[27px] pt-6">
        <div className="space-y-[10px]">
          <DetailItem
            icon="/icons/icon-stopwatch.svg"
            iconClass="h-5 w-[17px]"
            text="2026년 05월 30일 16:00"
            sub="(UTC)"
          />
          <div className="grid grid-cols-[190px_1fr] gap-y-[10px]">
            <DetailItem
              icon="/icons/icon-stadium.svg"
              iconClass="h-[18px] w-[18px]"
              text="캄 노우, 스타디움"
            />
            <DetailItem
              icon="/icons/icon-marker.svg"
              iconClass="h-5 w-3"
              text="스페인, 바르셀로나"
            />
            <DetailItem
              icon="/icons/icon-seat.svg"
              iconClass="h-[11px] w-[18px]"
              text="라운지 / 개별좌석"
              sub="(VIP)"
            />
            <DetailItem
              icon="/icons/icon-ticket.svg"
              iconClass="h-3 w-5"
              text="820,000원"
              sub="(가격변동)"
            />
          </div>
        </div>
      </section>

      <div className="mx-4 mt-7 border-t border-line" />

      {/* 준비 및 주의사항 */}
      <section className="px-[27px] pb-8 pt-6">
        <p className="mb-[10px] text-[8px] font-bold leading-[9px]">준비 및 주의사항</p>
        <div className="flex h-[210px] items-center justify-center rounded border border-line bg-white">
          <span className="text-[10px] text-soft">준비 및 주의사항 내용</span>
        </div>
      </section>

      <BottomCTA label="티켓 결제하기" href="/status" arrow />
    </div>
  );
}
