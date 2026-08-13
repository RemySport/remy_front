"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildKakaoAuthorizeUrl } from "@/lib/kakao";
import { testLogin } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { XIcon } from "@/components/icons";

function TestLoginSheet({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await testLogin(email.trim(), password);
      if (result.accessToken && result.refreshToken) {
        await login({ accessToken: result.accessToken, refreshToken: result.refreshToken });
        router.replace("/tickets");
      } else {
        setError("로그인에 실패했습니다.");
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "로그인 처리 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60">
      <div className="mx-auto w-full max-w-[402px] rounded-t-2xl bg-white px-6 pb-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-black">테스트 계정으로 접속</h2>
          <button type="button" onClick={onClose} aria-label="닫기">
            <XIcon className="h-3 w-3 text-black" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="email"
            className="h-[50px] w-full rounded border border-line px-4 text-xs text-black outline-none placeholder:text-soft"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            className="h-[50px] w-full rounded border border-line px-4 text-xs text-black outline-none placeholder:text-soft"
          />
        </div>

        {error && <p className="mt-3 text-xs font-bold text-primary">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-6 flex h-[50px] w-full items-center justify-center rounded-md bg-primary text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? "로그인 처리 중..." : "로그인"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [showTestLogin, setShowTestLogin] = useState(false);

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

        <button
          type="button"
          onClick={() => setShowTestLogin(true)}
          className="mt-4 w-full text-center text-xs font-bold text-[#DDDDDD] underline"
        >
          테스트 계정으로 접속
        </button>
      </div>

      {showTestLogin && <TestLoginSheet onClose={() => setShowTestLogin(false)} />}
    </div>
  );
}
