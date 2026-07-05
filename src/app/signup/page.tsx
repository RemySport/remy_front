"use client";

import { useState } from "react";
import TopBarSub from "@/components/TopBarSub";
import SectionTitle from "@/components/SectionTitle";
import BottomCTA from "@/components/BottomCTA";
import { ArrowDownIcon, CheckIcon } from "@/components/icons";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-[10px] text-[8px] font-bold leading-[9px]">{children}</p>
  );
}

export default function SignupPage() {
  const [agreeAll, setAgreeAll] = useState(true);
  const [verifying, setVerifying] = useState(false);

  return (
    <div className="pb-[130px]">
      <TopBarSub title="회원가입" icon="x" href="/login" />

      <section className="px-4 pt-7">
        <SectionTitle
          label="회원가입"
          title={"서비스 이용과 티켓 구매 시 검증을 위한\n정보가 필요합니다."}
        />
      </section>

      <div className="mx-4 mt-7 border-t border-line" />

      <form className="px-[27px] pt-7" onSubmit={(e) => e.preventDefault()}>
        {/* 성함 및 생년정보 */}
        <FieldLabel>
          성함 및 생년정보 <span className="text-soft">(필수)</span>
        </FieldLabel>
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="이름을 입력하세요"
            className="h-[50px] w-[164px] rounded border border-line px-4 text-xs outline-none placeholder:text-soft"
          />
          <button
            type="button"
            className="flex h-[50px] w-[164px] items-center justify-between border border-black bg-white px-4 text-xs font-extrabold"
          >
            태어난 해 (필수)
            <ArrowDownIcon className="h-[15px] w-[14px] text-black" />
          </button>
        </div>

        {/* 휴대폰 번호 */}
        <div className="mt-7">
          <FieldLabel>
            휴대폰 번호 <span className="text-soft">(필수)</span>
          </FieldLabel>
          <div className="flex items-center justify-between">
            <input
              type="tel"
              placeholder="휴대폰 번호를 입력하세요"
              defaultValue="010 - 1234 - 5678"
              className="h-[50px] w-[270px] rounded border border-line px-4 text-xs font-extrabold outline-none placeholder:font-normal placeholder:text-soft"
            />
            <button
              type="button"
              onClick={() => setVerifying(true)}
              className="h-[50px] w-[68px] bg-black text-xs font-extrabold text-white"
            >
              인증
            </button>
          </div>
        </div>

        {/* 인증번호 입력 */}
        {verifying && (
          <div className="mt-7">
            <p className="mb-[10px] text-xs font-extrabold leading-[13px]">
              인증번호 입력
            </p>
            <div className="flex items-center gap-[10px]">
              <div className="flex h-[50px] w-[268px] items-center justify-between rounded border border-line px-4">
                <input
                  type="text"
                  placeholder="인증번호를 입력하세요"
                  className="w-full text-xs outline-none placeholder:text-soft"
                />
                <span className="shrink-0 text-xs">02:59</span>
              </div>
              <button
                type="button"
                onClick={() => setVerifying(false)}
                className="h-9 w-[50px] rounded-[10px] bg-black text-xs font-extrabold text-white"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 이메일 */}
        <div className="mt-7">
          <FieldLabel>
            이메일 <span className="text-soft">(필수)</span>
          </FieldLabel>
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="이메일을 입력하세요"
              className="h-[50px] w-[194px] rounded border border-line px-4 text-xs outline-none placeholder:text-soft"
            />
            <span className="text-xs font-extrabold">@</span>
            <button
              type="button"
              className="flex h-[50px] w-[134px] items-center justify-between border border-black bg-white px-4 text-xs font-extrabold"
            >
              naver.com
              <ArrowDownIcon className="h-[15px] w-[14px] text-black" />
            </button>
          </div>
        </div>
      </form>

      {/* 동의 영역 */}
      <section className="mt-9 bg-[#F4F4F4] px-[27px] py-8">
        <button
          type="button"
          onClick={() => setAgreeAll(!agreeAll)}
          className="flex items-center gap-3"
        >
          <span className="flex h-5 w-5 items-center justify-center border border-line bg-white">
            {agreeAll && <CheckIcon className="h-2 w-[11px] text-check" />}
          </span>
          <span className="text-xs font-bold">전체동의</span>
        </button>

        <div className="my-7 border-t border-line" />

        <FieldLabel>
          이용약관 동의 <span className="text-soft">(필수)</span>
        </FieldLabel>
        <div className="flex h-[50px] items-center justify-between rounded border border-line bg-white pl-4 pr-[7px]">
          <span className="text-xs">이용에 따른 기본약관 동의</span>
          <button
            type="button"
            className="h-9 w-[69px] rounded-[10px] bg-black text-xs font-extrabold text-white"
          >
            전체보기
          </button>
        </div>

        <div className="mt-5">
          <FieldLabel>
            개인정보 수집 및 이용 동의 <span className="text-soft">(필수)</span>
          </FieldLabel>
          <div className="flex h-[50px] items-center justify-between rounded border border-line bg-white pl-4 pr-[7px]">
            <span className="text-xs">이용에 필요한 개인정보 수집 및 이용동의</span>
            <button
              type="button"
              className="h-9 w-[69px] rounded-[10px] bg-black text-xs font-extrabold text-white"
            >
              전체보기
            </button>
          </div>
        </div>
      </section>

      <BottomCTA label="가입하기" href="/myteam" />
    </div>
  );
}
