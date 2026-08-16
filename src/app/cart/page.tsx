"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBarSub from "@/components/TopBarSub";
import BottomCTA from "@/components/BottomCTA";
import ImageWithFallback from "@/components/ImageWithFallback";
import { MinusIcon, PlusIcon, XIcon } from "@/components/icons";
import { useCart } from "@/lib/cart/CartContext";
import { createGoodsOrder } from "@/lib/api/goodsOrders";
import { payGoodsOrder } from "@/lib/api/payments";
import { getPaymentMethods, type PaymentMethodResponse } from "@/lib/api/user";
import { ApiError } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const status = useRequireAuth();
  const router = useRouter();
  const { items, setQuantity, removeItem, clear, totalAmount } = useCart();

  const [step, setStep] = useState<"cart" | "confirm">("cart");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (status !== "authenticated") {
    return null;
  }

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const order = await createGoodsOrder({
        items: items.map((i) => ({ goodsId: i.goodsId, variantId: i.variantId, quantity: i.quantity })),
      });
      setOrderId(order.orderId);
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
      setPaymentMethodId(methods.find((m) => m.isDefault)?.paymentMethodId ?? methods[0]?.paymentMethodId ?? null);
      setStep("confirm");
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "주문 처리 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async () => {
    if (!orderId) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await payGoodsOrder({
        orderId,
        paymentMethodId: paymentMethodId ?? undefined,
        amount: totalAmount,
      });
      clear();
      router.replace("/goods/orders");
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "결제 처리 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-[130px]">
      <TopBarSub title={step === "cart" ? "장바구니" : "결제 확인"} icon="back" href="/goods" />

      {step === "cart" ? (
        <section className="px-4 pt-6">
          {items.length === 0 ? (
            <p className="py-10 text-center text-xs text-soft">
              장바구니가 비어 있습니다.{" "}
              <Link href="/goods" className="font-bold text-primary underline">
                굿즈 보러가기
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.goodsId}-${item.variantId}`}
                  className="flex gap-3 rounded border border-line bg-white p-3"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded border border-line">
                    <ImageWithFallback
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="break-words text-xs font-bold">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.goodsId, item.variantId)}
                        aria-label="삭제"
                        className="shrink-0"
                      >
                        <XIcon className="h-[11px] w-[11px] text-soft" />
                      </button>
                    </div>
                    {item.optionLabel && <p className="mt-1 truncate text-[10px] text-soft">{item.optionLabel}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex h-8 w-[100px] items-center justify-between border border-line px-2">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.goodsId, item.variantId, item.quantity - 1)}
                          aria-label="수량 감소"
                        >
                          <MinusIcon className="h-[2px] w-3 text-black" />
                        </button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.goodsId, item.variantId, item.quantity + 1)}
                          aria-label="수량 증가"
                        >
                          <PlusIcon className="h-3 w-3 text-black" />
                        </button>
                      </div>
                      <span className="text-xs font-extrabold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 flex items-center justify-between rounded border border-line bg-white p-4">
                <span className="text-xs text-soft">총 결제 금액</span>
                <span className="text-sm font-extrabold text-primary">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          )}
          {actionError && <p className="mt-4 text-xs font-bold text-primary">{actionError}</p>}
        </section>
      ) : (
        <section className="px-4 pt-6">
          <p className="mb-[10px] text-[8px] font-bold leading-[9px]">주문 내역</p>
          <div className="space-y-3 rounded border border-line bg-white p-4">
            {items.map((item) => (
              <div key={`${item.goodsId}-${item.variantId}`} className="flex items-center justify-between text-xs">
                <span className="truncate text-soft">
                  {item.name}
                  {item.optionLabel ? ` (${item.optionLabel})` : ""} × {item.quantity}
                </span>
                <span className="shrink-0 font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-line pt-3 text-xs">
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

      {step === "cart" ? (
        <BottomCTA
          label={submitting ? "처리 중..." : "결제하기"}
          onClick={handleCheckout}
          disabled={submitting || items.length === 0}
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
