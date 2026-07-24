"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { kakaoLogin } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { setRegisterToken } from "@/lib/auth/tokenStorage";
import { getKakaoRedirectUri } from "@/lib/kakao";

function LoadingMessage() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-sm text-soft">로그인 처리 중입니다...</p>
    </div>
  );
}

function KakaoCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    Promise.resolve()
      .then(async () => {
        if (errorParam) {
          setError("카카오 로그인이 취소되었습니다.");
          return;
        }
        if (!code) {
          setError("잘못된 접근입니다.");
          return;
        }
        const result = await kakaoLogin(code, getKakaoRedirectUri());
        if (result.isNewUser) {
          if (result.registerToken) setRegisterToken(result.registerToken);
          router.replace("/signup");
        } else if (result.accessToken && result.refreshToken) {
          await login({ accessToken: result.accessToken, refreshToken: result.refreshToken });
          router.replace("/tickets");
        } else {
          setError("로그인에 실패했습니다.");
        }
      })
      .catch((e) => {
        setError(e instanceof ApiError ? e.message : "로그인 처리 중 문제가 발생했습니다.");
      });
  }, [searchParams, router, login]);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-soft">{error}</p>
        <Link href="/login" className="text-sm font-bold text-primary underline">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return <LoadingMessage />;
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<LoadingMessage />}>
      <KakaoCallbackInner />
    </Suspense>
  );
}
