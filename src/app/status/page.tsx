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
  const [notice, setNotice] = useState<string | null>(null);
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

  const handleCancel = async (reservationId: number, reservationStatus: string) => {
    const confirmed = window.confirm(reservationStatus === "PAID"
      ? "결제된 예약을 취소하고 결제 금액 전액을 환불하시겠습니까?"
      : "결제 전 예약과 좌석 선점을 취소하시겠습니까?");
    if (!confirmed) return;
    setCancellingId(reservationId);
    setError(null);
    setNotice(null);
    try {
      const result=await cancelReservation(reservationId, reservationStatus === "PAID" ? "개인 일정 변경" : undefined);
      if (result.status === "CANCELLED") {
        setReservations((prev) => prev?.filter((r) => r.reservationId !== reservationId) ?? null);
        setNotice(reservationStatus === "PAID" ? "전액 환불이 완료되었습니다." : "예약이 취소되었습니다.");
      } else if (result.status === "CANCELLING" || result.status === "CANCEL_IN_DOUBT") {
        setReservations((prev) => prev?.map((r) => r.reservationId === reservationId
          ? { ...r, paymentStatus: result.status }
          : r) ?? null);
        setNotice("환불 결과를 확인 중입니다. 중복으로 취소하지 마세요.");
      }
    } catch (e) {
      const detail=e instanceof ApiError ? ` (${e.message})` : "";
      setError(`취소 요청 결과를 확인할 수 없습니다. 다시 요청하지 말고 예약 상태를 새로 확인해 주세요.${detail}`);
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
            {notice && <p role="status" className="rounded-md bg-[#F4F4F4] px-3 py-3 text-center text-xs text-soft">{notice}</p>}
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
