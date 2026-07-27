"use client";

import { buildKakaoAuthorizeUrl } from "@/lib/kakao";

export default function LoginPage() {
  const handleKakaoLogin = () => {
    window.location.href = buildKakaoAuthorizeUrl();
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black">
      {/* 배경 사진 + 어두운 오버레이 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/login-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* 상단 흰색 곡선 영역 */}
      <div className="absolute left-[-199px] top-[-350px] h-[740px] w-[770px] rotate-[-9deg] rounded-[50%] bg-white" />

      {/* 설명글 */}
      <div className="absolute left-8 top-[150px]">
        <h1 className="text-[22px] leading-6 text-black">
          우리 팀 경기를
          <br />
          <b className="font-extrabold">직관할 준비</b> 됐나요?
        </h1>
        <p className="mt-4 text-xs leading-5 text-[#555555]">
          우리 팀 경기를 사전에 <b className="font-extrabold text-black">미리 예약하고</b>
          <br />
          <b className="font-extrabold text-primary">현지 직관</b>으로 즐겨보세요 :)
        </p>
      </div>

      {/* 하단 로그인 영역 */}
      <div className="absolute inset-x-4 bottom-[100px]">
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-[#555555]" />
          <span className="text-xs font-bold text-soft">자주쓰는 채널은?</span>
          <span className="h-px flex-1 bg-[#555555]" />
        </div>

        <button
          type="button"
          onClick={handleKakaoLogin}
          aria-label="카카오 로그인"
          className="mt-8 flex w-full items-center gap-6 rounded-2xl bg-white/10 px-4 py-4 text-left shadow-lg backdrop-blur-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-kakao.svg" alt="" className="h-14 w-14 shrink-0" />
          <div className="ml-2">
            <p className="text-xs font-bold leading-[13px] text-[#DDDDDD]">
              서비스 접속을 위한
            </p>
            <p className="mt-2 text-xl font-extrabold leading-6 text-white">
              카카오 로그인
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
