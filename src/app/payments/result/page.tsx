"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TopBarSub from "@/components/TopBarSub";
import { ApiError } from "@/lib/api/client";
import { getPaymentStatus, type PaymentStatusResponse } from "@/lib/api/payments";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { formatPrice } from "@/lib/format";

const FINAL_STATUSES = new Set(["PAID", "FAILED", "CANCELLED", "PARTIAL_REFUNDED", "EXPIRED"]);

const STATUS_COPY: Record<string, { title: string; description: string }> = {
  READY: { title: "결제 인증 대기", description: "결제창 인증을 기다리고 있습니다." },
  APPROVING: { title: "결제 확인 중", description: "카드사 승인 결과를 확인하고 있습니다." },
  IN_DOUBT: { title: "결제 확인 중", description: "응답이 지연되어 실제 승인 여부를 다시 조회하고 있습니다." },
  RECOVERING: { title: "결제 복구 확인 중", description: "중복 결제 없이 기존 주문의 결과를 확인하고 있습니다." },
  PAID: { title: "결제가 완료되었습니다", description: "현지 티켓 확보 확인에는 1~2일이 걸릴 수 있습니다." },
  FAILED: { title: "결제가 승인되지 않았습니다", description: "카드사 승인 결과가 실패로 확정되었습니다." },
  CANCELLING: { title: "환불 확인 중", description: "전액 환불 결과를 확인하고 있습니다." },
  CANCEL_IN_DOUBT: { title: "환불 확인 중", description: "환불 응답이 지연되어 결과를 다시 조회하고 있습니다." },
  CANCELLED: { title: "환불이 완료되었습니다", description: "카드사 반영 시점은 카드사 정책에 따라 다를 수 있습니다." },
  PARTIAL_REFUNDED: { title: "일부 금액이 환불되었습니다", description: "주문 상세 또는 고객센터에서 내역을 확인해 주세요." },
  EXPIRED: { title: "결제 시간이 만료되었습니다", description: "티켓을 다시 선택해 주세요." },
};

function PaymentResultContent() {
  const authStatus = useRequireAuth();
  const searchParams = useSearchParams();
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingStopped, setPollingStopped] = useState(false);

  const orderId = useMemo(() => {
    const fromQuery = searchParams.get("orderId");
    if (fromQuery) return fromQuery;
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("remy:lastPaymentOrderId");
  }, [searchParams]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!orderId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async (attempt: number) => {
      try {
        const next = await getPaymentStatus(orderId);
        if (cancelled) return;
        setPayment(next);
        setError(null);

        if (FINAL_STATUSES.has(next.status)) {
          sessionStorage.removeItem("remy:lastPaymentOrderId");
          return;
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "결제 상태를 불러오지 못했습니다.");
      }

      if (attempt >= 11) {
        setPollingStopped(true);
        return;
      }

      const delay = Math.min(2_000 + attempt * 1_000, 10_000);
      timer = setTimeout(() => void poll(attempt + 1), delay);
    };

    void poll(0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [authStatus, orderId]);

  if (authStatus !== "authenticated") return null;

  const copy = payment ? STATUS_COPY[payment.status] ?? {
    title: "결제 상태 확인",
    description: "주문 상태를 확인하고 있습니다.",
  } : null;

  return (
    <div className="min-h-dvh pb-12">
      <TopBarSub title="결제 결과" icon="back" href="/status" />
      <main className="px-7 pt-16 text-center">
        {!orderId && <p className="text-sm font-bold text-primary">확인할 주문번호가 없습니다.</p>}
        {orderId && !payment && !error && <p className="text-sm font-bold">결제 상태를 확인하고 있습니다...</p>}

        {copy && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-black text-white">
              {payment?.status === "PAID" ? "✓" : "·"}
            </div>
            <h1 className="mt-6 text-xl font-extrabold">{copy.title}</h1>
            <p className="mt-3 text-xs leading-5 text-soft">{copy.description}</p>
            <div className="mt-8 rounded border border-line bg-white p-4 text-left text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-soft">주문번호</span>
                <span className="break-all text-right font-bold">{payment?.orderId}</span>
              </div>
              {payment?.paidAmount != null && (
                <div className="mt-3 flex justify-between gap-4">
                  <span className="text-soft">승인 금액</span>
                  <span className="font-bold">{formatPrice(payment.paidAmount)}</span>
                </div>
              )}
            </div>
          </>
        )}

        {error && <p className="mt-6 text-xs font-bold text-primary">{error}</p>}
        {pollingStopped && (
          <p className="mt-4 text-xs leading-5 text-soft">
            확인이 오래 걸리고 있습니다. 새 결제를 시작하지 말고 예약 내역에서 같은 주문을 다시 확인해 주세요.
          </p>
        )}

        <div className="mt-10 grid grid-cols-2 gap-3">
          <Link href="/status" className="flex h-11 items-center justify-center rounded border border-black text-xs font-bold">
            예약 내역
          </Link>
          <Link href="/tickets" className="flex h-11 items-center justify-center rounded bg-black text-xs font-bold text-white">
            티켓 보기
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center text-sm">확인 중...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}
