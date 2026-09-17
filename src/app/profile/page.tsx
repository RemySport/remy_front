"use client";

import { useEffect, useState } from "react";
import TopBarSub from "@/components/TopBarSub";
import { getMe, updateMe, type UserInfoResponse } from "@/lib/api/user";
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

  useEffect(() => {
    if (status !== "authenticated") return;
    getMe()
      .then((res) => {
        setMe(res);
        setNickname(res.nickname);
        setPhoneNumber(res.phoneNumber ?? "");
      })
      .catch(() => {});
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
    </div>
  );
}
