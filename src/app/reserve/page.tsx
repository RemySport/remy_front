"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopBarSub from "@/components/TopBarSub";
import BottomCTA from "@/components/BottomCTA";
import ImageWithFallback from "@/components/ImageWithFallback";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { getTicket, type PriceInfo, type TicketDetailResponse } from "@/lib/api/tickets";
import { createReservation } from "@/lib/api/reservations";
import { pay } from "@/lib/api/payments";
import { getPaymentMethods, type PaymentMethodResponse } from "@/lib/api/user";
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
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
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
    if (!ticket) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const reservation = await createReservation({ ticketId: ticket.ticketId, quantity });
      setReservationId(reservation.reservationId);
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
      setPaymentMethodId(methods.find((m) => m.isDefault)?.paymentMethodId ?? methods[0]?.paymentMethodId ?? null);
      setStep("confirm");
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "예약 처리 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async () => {
    if (!reservationId) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await pay({
        reservationId,
        paymentMethodId: paymentMethodId ?? undefined,
        amount: totalAmount,
      });
      router.replace("/status");
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "결제 처리 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-[130px]">
      <TopBarSub title={step === "select" ? "티켓 예약하기" : "티켓 확정하기"} icon="back" href="/tickets" />

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
                  key={grade.grade}
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

      {step === "select" && actionError && (
        <section className="px-[27px] pb-8 pt-6">
          <p className="text-xs font-bold text-primary">{actionError}</p>
        </section>
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
              <span className="font-extrabold">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <p className="mb-[10px] mt-6 text-[8px] font-bold leading-[9px]">결제 수단</p>
          {paymentMethods.length === 0 ? (
            <p className="text-xs text-soft">등록된 결제 수단이 없습니다. 마이페이지에서 결제 수단을 등록해주세요.</p>
          ) : (
            <div className="space-y-[10px]">
              {paymentMethods.map((m) => (
                <button
                  key={m.paymentMethodId}
                  type="button"
                  onClick={() => setPaymentMethodId(m.paymentMethodId)}
                  className={`flex h-[50px] w-full items-center justify-between rounded border px-4 text-xs font-bold ${
                    paymentMethodId === m.paymentMethodId ? "border-primary" : "border-line"
                  }`}
                >
                  <span>{m.cardCompany ?? m.bankName ?? m.type}</span>
                  <span className="text-soft">{m.cardNumberMasked ?? m.accountNumberMasked}</span>
                </button>
              ))}
            </div>
          )}
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
          label={submitting ? "결제 처리 중..." : "카드 결제하기"}
          onClick={handlePay}
          disabled={submitting || (paymentMethods.length > 0 && !paymentMethodId)}
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
