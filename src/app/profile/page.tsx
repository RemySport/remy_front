"use client";

import { useEffect, useState } from "react";
import TopBarSub from "@/components/TopBarSub";
import {
  deletePaymentMethod,
  getMe,
  getPaymentMethods,
  registerPaymentMethod,
  updateMe,
  type PaymentMethodResponse,
  type UserInfoResponse,
} from "@/lib/api/user";
import { ApiError } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

export default function ProfilePage() {
  const status = useRequireAuth();

  const [me, setMe] = useState<UserInfoResponse | null>(null);
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [methods, setMethods] = useState<PaymentMethodResponse[]>([]);
  const [addingCard, setAddingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardCompany, setCardCompany] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    getMe()
      .then((res) => {
        setMe(res);
        setNickname(res.nickname);
        setPhoneNumber(res.phoneNumber ?? "");
      })
      .catch(() => {});
    getPaymentMethods()
      .then(setMethods)
      .catch(() => setMethods([]));
  }, [status]);

  if (status !== "authenticated") return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const res = await updateMe({ nickname, phoneNumber: phoneNumber || undefined });
      setMe((prev) => (prev ? { ...prev, nickname: res.nickname, phoneNumber: res.phoneNumber } : prev));
      setSaveMessage("저장되었습니다.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "저장 중 문제가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCard = async () => {
    if (!cardNumber || !cardCompany) return;
    setError(null);
    try {
      await registerPaymentMethod({
        type: "CREDIT_CARD",
        cardNumber,
        cardCompany,
        expiryDate,
        isDefault: methods.length === 0,
      });
      setMethods(await getPaymentMethods());
      setAddingCard(false);
      setCardNumber("");
      setCardCompany("");
      setExpiryDate("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "결제수단 등록 중 문제가 발생했습니다.");
    }
  };

  const handleDeleteMethod = async (id: number) => {
    setError(null);
    try {
      await deletePaymentMethod(id);
      setMethods((prev) => prev.filter((m) => m.paymentMethodId !== id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "삭제 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="pb-16">
      <TopBarSub title="마이페이지" icon="back" href="/menu" />

      <section className="px-4 pt-7">
        <p className="text-xs text-soft">이메일</p>
        <p className="mt-1 text-sm font-bold">{me?.email}</p>
      </section>

      <section className="px-4 pt-6">
        <p className="mb-2 text-xs text-soft">닉네임</p>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="h-11 w-full rounded border border-line px-4 text-xs outline-none"
        />
      </section>

      <section className="px-4 pt-4">
        <p className="mb-2 text-xs text-soft">전화번호</p>
        <input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="h-11 w-full rounded border border-line px-4 text-xs outline-none"
        />
      </section>

      {(error || saveMessage) && (
        <p className={`px-4 pt-3 text-xs font-bold ${error ? "text-primary" : "text-soft"}`}>
          {error ?? saveMessage}
        </p>
      )}

      <section className="px-4 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-11 w-full rounded-md bg-primary text-xs font-bold text-white disabled:opacity-50"
        >
          {saving ? "저장 중..." : "정보 저장"}
        </button>
      </section>

      <div className="mx-4 mt-8 border-t border-line" />

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold">결제 수단</p>
          <button type="button" onClick={() => setAddingCard((v) => !v)} className="text-xs font-bold text-primary">
            {addingCard ? "취소" : "+ 추가"}
          </button>
        </div>

        {addingCard && (
          <div className="mt-3 space-y-2 rounded border border-line p-3">
            <input
              value={cardCompany}
              onChange={(e) => setCardCompany(e.target.value)}
              placeholder="카드사"
              className="h-10 w-full rounded border border-line px-3 text-xs outline-none"
            />
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="카드번호"
              className="h-10 w-full rounded border border-line px-3 text-xs outline-none"
            />
            <input
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              placeholder="유효기간 (MM/YY)"
              className="h-10 w-full rounded border border-line px-3 text-xs outline-none"
            />
            <button
              type="button"
              onClick={handleAddCard}
              className="h-9 w-full rounded bg-black text-xs font-bold text-white"
            >
              등록
            </button>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {methods.length === 0 && <p className="text-xs text-soft">등록된 결제수단이 없습니다.</p>}
          {methods.map((m) => (
            <div key={m.paymentMethodId} className="flex items-center justify-between rounded border border-line px-3 py-3">
              <div className="text-xs">
                <p className="font-bold">
                  {m.cardCompany ?? m.bankName ?? m.type}
                  {m.isDefault ? " (기본)" : ""}
                </p>
                <p className="mt-1 text-soft">{m.cardNumberMasked ?? m.accountNumberMasked}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteMethod(m.paymentMethodId)}
                className="text-xs text-soft underline"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
