"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopBarSub from "@/components/TopBarSub";
import BottomCTA from "@/components/BottomCTA";
import ImageWithFallback from "@/components/ImageWithFallback";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { getTicket, type PriceInfo, type TicketDetailResponse } from "@/lib/api/tickets";
import { createReservation } from "@/lib/api/reservations";
import {
  approvePayment,
  openPaypleCheckout,
  preparePayment,
  type PaymentPrepareResponse,
  type PaypleAuthResult,
} from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { formatKoreanDate, formatPrice, formatTime } from "@/lib/format";

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

function ReservePageInner() {
  const status = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId");

  const [ticket, setTicket] = useState<TicketDetailResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState<PriceInfo | null>(null);

  const [step, setStep] = useState<"select" | "confirm">("select");
  const [preparedPayment, setPreparedPayment] = useState<PaymentPrepareResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve()
      .then(() => {
        if (!ticketId) throw new Error("잘못된 접근입니다.");
        return getTicket(ticketId);
      })
      .then((detail) => {
        setTicket(detail);
        setSelectedGrade(detail.priceInfo[0] ?? null);
      })
      .catch((e) =>
        setLoadError(e instanceof ApiError || e instanceof Error ? e.message : "티켓 정보를 불러오지 못했습니다.")
      );
  }, [ticketId]);

  if (status !== "authenticated") {
    return null;
  }

  if (loadError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-8 text-center">
        <p className="text-sm text-soft">{loadError}</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-soft">불러오는 중...</p>
      </div>
    );
  }

  const unitPrice = selectedGrade?.price ?? 0;
  const totalAmount = unitPrice * quantity;

  const handleReserve = async () => {
    if (!ticket || !selectedGrade) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const reservation = await createReservation({
        ticketId: ticket.ticketId,
        quantity,
        ticketOptionId: selectedGrade.ticketOptionId,
      });
      const prepared = await preparePayment(reservation.reservationId);
      setPreparedPayment(prepared);
      setStep("confirm");
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "예약 처리 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async () => {
    if (!preparedPayment) return;
    setSubmitting(true);
    setActionError(null);

    const handlePaypleResult = async (result: PaypleAuthResult) => {
      if (result.PCD_PAY_RST !== "success") {
        setActionError(result.PCD_PAY_MSG || "카드 인증이 완료되지 않았습니다.");
        setSubmitting(false);
        return;
      }

      if (!result.PCD_AUTH_KEY || !result.PCD_PAY_REQKEY) {
        setActionError("결제 인증 결과가 올바르지 않습니다. 결제 상태를 다시 확인해 주세요.");
        setSubmitting(false);
        return;
      }

      try {
        await approvePayment({
          orderId: preparedPayment.orderId,
          authKey: result.PCD_AUTH_KEY,
          payReqKey: result.PCD_PAY_REQKEY,
        });
      } catch {
        // 승인 응답을 받지 못했어도 실제 승인은 완료됐을 수 있다. 결과 화면에서 같은 주문을 조회한다.
      }
      router.replace(`/payments/result?orderId=${encodeURIComponent(preparedPayment.orderId)}`);
    };

    try {
      sessionStorage.setItem("remy:lastPaymentOrderId", preparedPayment.orderId);
      await openPaypleCheckout(preparedPayment, handlePaypleResult);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "결제창을 여는 중 문제가 발생했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-[130px]">
      <TopBarSub title="티켓 예약하기" icon="back" href="/tickets" />

      <section className="flex items-start justify-between px-4 pt-7">
        <div>
          <div className="flex items-center gap-[6px]">
            <span className="h-[10px] w-[3px] bg-primary" />
            <span className="text-[10px] font-extrabold leading-[11px]">{ticket.leagueName ?? "미분류"} 리그</span>
          </div>
          <h2 className="mt-[10px] text-lg font-extrabold leading-[23px]">
            {ticket.home?.name ?? "?"} <span className="text-sm">VS</span>
            <br />
            {ticket.away?.name ?? "?"}
          </h2>
        </div>

        {/* 홈/원정 팀 박스 */}
        <div className="relative mt-2 h-[60px] w-[140px] shrink-0 rounded-md border border-line bg-white">
          <span className="absolute left-1/2 top-1/2 h-[68px] w-px -translate-x-1/2 -translate-y-1/2 rotate-[16deg] bg-[#D9D9D9]" />
          <ImageWithFallback
            src={ticket.home?.logoUrl}
            alt={ticket.home?.name ?? ""}
            className="absolute left-[15px] top-[6px] h-[30px] w-[30px] object-contain"
          />
          <span className="absolute bottom-[6px] left-[21px] text-[8px] font-bold leading-[9px]">홈 팀</span>
          <ImageWithFallback
            src={ticket.away?.logoUrl}
            alt={ticket.away?.name ?? ""}
            className="absolute right-[15px] top-[6px] h-[30px] w-[30px] object-contain"
          />
          <span className="absolute bottom-[6px] right-[17px] text-[8px] font-bold leading-[9px]">원정 팀</span>
          <span className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-[8px] font-black text-white">
            VS
          </span>
        </div>
      </section>

      <div className="mx-4 mt-7 border-t border-line" />

      {step === "select" ? (
        <>
          {/* 구매옵션: 좌석등급 */}
          <section className="px-[27px] pt-6">
            <p className="mb-[10px] text-[8px] font-bold leading-[9px]">
              좌석 등급 <span className="text-soft">(필수)</span>
            </p>
            <div className="flex flex-wrap gap-[10px]">
              {ticket.priceInfo.length === 0 && (
                <span className="text-xs text-soft">판매 중인 좌석이 없습니다.</span>
              )}
              {ticket.priceInfo.map((grade) => (
                <button
                  key={grade.ticketOptionId}
                  type="button"
                  onClick={() => setSelectedGrade(grade)}
                  className={`flex h-[50px] items-center justify-between gap-3 border px-4 text-xs font-extrabold ${
                    selectedGrade?.grade === grade.grade
                      ? "border-primary bg-primary text-white"
                      : "border-black bg-white text-black"
                  }`}
                >
                  {grade.grade}
                  <span className="font-normal">{formatPrice(grade.price)}</span>
                </button>
              ))}
            </div>

            {/* 수량 */}
            <p className="mb-[10px] mt-6 text-[8px] font-bold leading-[9px]">
              수량 <span className="text-soft">(필수)</span>
            </p>
            <div className="flex h-[50px] w-[164px] items-center justify-between border border-black bg-white px-4">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="수량 감소"
              >
                <MinusIcon className="h-[2px] w-3 text-black" />
              </button>
              <span className="text-xs font-extrabold">{quantity}매</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="수량 증가">
                <PlusIcon className="h-3 w-3 text-black" />
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
                text={`${formatKoreanDate(ticket.date)} ${formatTime(ticket.date)}`}
              />
              <div className="grid grid-cols-[190px_1fr] gap-y-[10px]">
                <DetailItem
                  icon="/icons/icon-stadium.svg"
                  iconClass="h-[18px] w-[18px]"
                  text={ticket.stadium?.name ?? "구장 미정"}
                />
                <DetailItem
                  icon="/icons/icon-marker.svg"
                  iconClass="h-5 w-3"
                  text={[ticket.stadium?.country, ticket.stadium?.city].filter(Boolean).join(", ") || "-"}
                />
                <DetailItem
                  icon="/icons/icon-seat.svg"
                  iconClass="h-[11px] w-[18px]"
                  text={selectedGrade?.grade ?? "좌석 미선택"}
                />
                <DetailItem
                  icon="/icons/icon-ticket.svg"
                  iconClass="h-3 w-5"
                  text={formatPrice(selectedGrade?.price)}
                  sub="(1매 기준)"
                />
              </div>
            </div>
          </section>
        </>
      ) : null}

      {step === "select" && (
        <>
          <div className="mx-4 mt-7 border-t border-line" />
          <section className="px-[27px] pb-8 pt-6">
            <p className="mb-[10px] text-[8px] font-bold leading-[9px]">준비 및 주의사항</p>
            <div className="flex min-h-[80px] items-center justify-center rounded border border-line bg-white p-4">
              <span className="text-center text-[10px] text-soft">
                {ticket.ageLimit ? `관람 연령: ${ticket.ageLimit}` : "준비 및 주의사항 내용"}
              </span>
            </div>
            {actionError && <p className="mt-4 text-xs font-bold text-primary">{actionError}</p>}
          </section>
        </>
      )}

      {step === "confirm" && (
        <section className="px-[27px] pt-6">
          <p className="mb-[10px] text-[8px] font-bold leading-[9px]">결제 확인</p>
          <div className="space-y-3 rounded border border-line bg-white p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-soft">좌석 등급</span>
              <span className="font-bold">{selectedGrade?.grade ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-soft">수량</span>
              <span className="font-bold">{quantity}매</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-soft">결제 금액</span>
              <span className="font-extrabold">{formatPrice(preparedPayment?.amount ?? totalAmount)}</span>
            </div>
          </div>

          <div className="mt-6 rounded border border-line bg-[#F8F8F8] p-4 text-[10px] leading-4 text-soft">
            결제하기를 누르면 페이플 카드·간편결제 창이 열립니다. 카드 정보는 Remy 서버에 저장되지 않습니다.
            결제가 끝나도 티켓은 현지 확인 후 확정됩니다.
          </div>
          {actionError && <p className="mt-4 text-xs font-bold text-primary">{actionError}</p>}
        </section>
      )}

      {step === "select" ? (
        <BottomCTA
          label={submitting ? "처리 중..." : "티켓 예약하기"}
          onClick={handleReserve}
          disabled={submitting || !selectedGrade}
        />
      ) : (
        <BottomCTA
          label={submitting ? "결제 처리 중..." : "결제하기"}
          onClick={handlePay}
          disabled={submitting || !preparedPayment}
        />
      )}
    </div>
  );
}

export default function ReservePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <p className="text-sm text-soft">불러오는 중...</p>
        </div>
      }
    >
      <ReservePageInner />
    </Suspense>
  );
}
