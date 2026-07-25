"use client";

import { useEffect, useState } from "react";
import TopBarMain from "@/components/TopBarMain";
import BottomNav from "@/components/BottomNav";
import SectionTitle from "@/components/SectionTitle";
import TogglePill from "@/components/TogglePill";
import ReservationCard from "@/components/ReservationCard";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { cancelReservation, getReservations, type ReservationSummary } from "@/lib/api/reservations";
import { ApiError } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

export default function StatusPage() {
  const status = useRequireAuth();
  const [tab, setTab] = useState<0 | 1>(0);
  const [reservations, setReservations] = useState<ReservationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    const filter = tab === 0 ? "RESERVED" : "PAST";
    Promise.resolve()
      .then(() => {
        setReservations(null);
        setError(null);
        return getReservations({ status: filter, size: 50 });
      })
      .then((res) => setReservations(res.reservations))
      .catch((e) => setError(e instanceof ApiError ? e.message : "예약 목록을 불러오지 못했습니다."));
  }, [tab, status]);

  const handleCancel = async (reservationId: number) => {
    setCancellingId(reservationId);
    try {
      await cancelReservation(reservationId);
      setReservations((prev) => prev?.filter((r) => r.reservationId !== reservationId) ?? null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "예약 취소 중 문제가 발생했습니다.");
    } finally {
      setCancellingId(null);
    }
  };

  if (status !== "authenticated") return null;

  const pendingCount = (reservations ?? []).filter((r) => r.status === "PENDING").length;
  const paidCount = (reservations ?? []).filter((r) => r.status === "PAID").length;

  return (
    <div className="pb-[130px]">
      <TopBarMain />

      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/watermark-ticket.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-[25px] top-[125px] h-[153px] w-[172px]"
        />

        <div className="relative px-4">
          <div className="pt-6">
            <TogglePill options={["예약티켓", "지난티켓"]} value={tab} onChange={setTab} />
          </div>

          <div className="mt-8">
            <SectionTitle
              label={tab === 0 ? "예약티켓" : "지난티켓"}
              title={tab === 0 ? "현재 예약된 티켓입니다." : "지난 티켓입니다."}
            />
          </div>

          {tab === 0 && (
            <div className="mt-5 grid grid-cols-2 divide-x divide-black rounded-md border border-black bg-white">
              <div className="flex h-[50px] items-center justify-between px-4">
                <span className="text-xs text-soft">예약된 티켓</span>
                <span className="text-xs font-extrabold">{paidCount} 장</span>
              </div>
              <div className="flex h-[50px] items-center justify-between px-4">
                <span className="text-xs text-soft">보류된 티켓</span>
                <span className="text-xs font-extrabold">{pendingCount} 장</span>
              </div>
            </div>
          )}

          <div className="mt-10 space-y-5">
            {error && <p className="text-center text-xs text-soft">{error}</p>}
            {!error && reservations === null && <p className="text-center text-xs text-soft">불러오는 중...</p>}
            {!error && reservations !== null && reservations.length === 0 && (
              <p className="text-center text-xs text-soft">표시할 티켓이 없습니다.</p>
            )}
            {(reservations ?? []).map((r) => (
              <ReservationCard
                key={r.reservationId}
                reservation={r}
                onCancel={tab === 0 ? handleCancel : undefined}
                cancelling={cancellingId === r.reservationId}
              />
            ))}
          </div>
        </div>
      </div>

      <ScrollToTopButton />
      <BottomNav active="ticket" />
    </div>
  );
}
