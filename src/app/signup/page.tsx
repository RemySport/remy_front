"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBarSub from "@/components/TopBarSub";
import SectionTitle from "@/components/SectionTitle";
import BottomCTA from "@/components/BottomCTA";
import TermsModal from "@/components/TermsModal";
import { CheckIcon } from "@/components/icons";
import { register } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { clearRegisterToken, getRegisterToken } from "@/lib/auth/tokenStorage";
import { PRIVACY_POLICY_TEXT, TERMS_OF_SERVICE_TEXT } from "@/lib/legalText";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-[10px] text-[8px] font-bold leading-[9px]">{children}</p>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [registerToken, setRegisterTokenState] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDoc, setOpenDoc] = useState<"terms" | "privacy" | null>(null);

  const agreeAll = agreeTerms && agreePrivacy;

  useEffect(() => {
    Promise.resolve().then(() => {
      const token = getRegisterToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      setRegisterTokenState(token);
    });
  }, [router]);

  const toggleAll = () => {
    const next = !agreeAll;
    setAgreeTerms(next);
    setAgreePrivacy(next);
  };

  const canSubmit = registerToken && nickname.trim().length > 0 && agreeTerms && agreePrivacy && !submitting;

  const handleSubmit = async () => {
    if (!registerToken || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const agreedTerms = ["TERMS_OF_SERVICE", "PRIVACY_POLICY"];
      const result = await register(registerToken, {
        nickname: nickname.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        agreedTerms,
      });
      clearRegisterToken();
      await login({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      router.replace("/tickets");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "회원가입 처리 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

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
        {/* 닉네임 */}
        <FieldLabel>
          닉네임 <span className="text-soft">(필수)</span>
        </FieldLabel>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력하세요"
          className="h-[50px] w-full rounded border border-line px-4 text-xs outline-none placeholder:text-soft"
        />

        {/* 휴대폰 번호 */}
        <div className="mt-7">
          <FieldLabel>
            휴대폰 번호 <span className="text-soft">(선택)</span>
          </FieldLabel>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="휴대폰 번호를 입력하세요"
            className="h-[50px] w-full rounded border border-line px-4 text-xs font-extrabold outline-none placeholder:font-normal placeholder:text-soft"
          />
        </div>

        {error && <p className="mt-4 text-xs font-bold text-primary">{error}</p>}
      </form>

      {/* 동의 영역 */}
      <section className="mt-9 bg-[#F3F3F3] px-[27px] py-8">
        <button type="button" onClick={toggleAll} className="flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center border border-line bg-white">
            {agreeAll && <CheckIcon className="h-2 w-[11px] text-check" />}
          </span>
          <span className="text-xs font-bold">전체동의</span>
        </button>

        <div className="my-7 border-t border-line" />

        <FieldLabel>
          이용약관 동의 <span className="text-soft">(필수)</span>
        </FieldLabel>
        <div className="relative">
          <button
            type="button"
            onClick={() => setAgreeTerms((v) => !v)}
            className="flex h-[50px] w-full items-center justify-between rounded border border-line bg-white pl-4 pr-[85px] text-left"
          >
            <span className="text-xs">이용에 따른 기본약관 동의</span>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-line bg-white">
              {agreeTerms && <CheckIcon className="h-2 w-[11px] text-check" />}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOpenDoc("terms")}
            className="absolute right-[7px] top-1/2 h-9 w-[69px] -translate-y-1/2 rounded-[10px] bg-black text-xs font-extrabold text-white"
          >
            전체보기
          </button>
        </div>

        <div className="mt-5">
          <FieldLabel>
            개인정보 수집 및 이용 동의 <span className="text-soft">(필수)</span>
          </FieldLabel>
          <div className="relative">
            <button
              type="button"
              onClick={() => setAgreePrivacy((v) => !v)}
              className="flex h-[50px] w-full items-center justify-between rounded border border-line bg-white pl-4 pr-[85px] text-left"
            >
              <span className="text-xs">이용에 필요한 개인정보 수집 및 이용동의</span>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-line bg-white">
                {agreePrivacy && <CheckIcon className="h-2 w-[11px] text-check" />}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setOpenDoc("privacy")}
              className="absolute right-[7px] top-1/2 h-9 w-[69px] -translate-y-1/2 rounded-[10px] bg-black text-xs font-extrabold text-white"
            >
              전체보기
            </button>
          </div>
        </div>
      </section>

      <BottomCTA
        label={submitting ? "가입 처리 중..." : "가입하기"}
        onClick={handleSubmit}
        disabled={!canSubmit}
      />

      {openDoc === "terms" && (
        <TermsModal title="이용약관" content={TERMS_OF_SERVICE_TEXT} onClose={() => setOpenDoc(null)} />
      )}
      {openDoc === "privacy" && (
        <TermsModal
          title="개인정보 수집 및 이용"
          content={PRIVACY_POLICY_TEXT}
          onClose={() => setOpenDoc(null)}
        />
      )}
    </div>
  );
}
