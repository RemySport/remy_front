"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBarSub from "@/components/TopBarSub";
import BottomCTA from "@/components/BottomCTA";
import ImageWithFallback from "@/components/ImageWithFallback";
import AddressSearchOverlay from "@/components/AddressSearchOverlay";
import { MinusIcon, PlusIcon, XIcon } from "@/components/icons";
import { useCart } from "@/lib/cart/CartContext";
import { createGoodsOrder, type ShippingInfoRequest } from "@/lib/api/goodsOrders";
import {
  approvePayment,
  openPaypleCheckout,
  prepareGoodsPayment,
  type PaymentPrepareResponse,
  type PaypleAuthResult,
} from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatPrice } from "@/lib/format";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-[10px] text-[8px] font-bold leading-[9px]">{children}</p>;
}

export default function CartPage() {
  const status = useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const { items, setQuantity, removeItem, totalAmount } = useCart();

  const [step, setStep] = useState<"cart" | "confirm">("cart");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [preparedPayment, setPreparedPayment] = useState<PaymentPrepareResponse | null>(null);

  // 배송설정 (Figma "굿즈 확정하기") — 주문 생성 시점에 함께 넘긴다.
  const [recipientName, setRecipientName] = useState("");
  const [zonecode, setZonecode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [showAddressSearch, setShowAddressSearch] = useState(false);

  // 가장 최근 굿즈 주문에 쓴 배송지(계정에 저장됨)를 한 번만 불러와 미리 채워준다.
  // user는 getMe() 응답이 오기 전까지 null이라, 값이 로드된 뒤 한 번만 실행되도록 ref로 막는다.
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (prefilledRef.current || !user) return;
    prefilledRef.current = true;
    void Promise.resolve().then(() => {
      const saved = user.defaultShipping;
      setRecipientName(saved?.recipientName || user.nickname || "");
      if (saved) {
        setZonecode(saved.zonecode);
        setAddress(saved.address);
        setAddressDetail(saved.addressDetail);
        setDeliveryMessage(saved.deliveryMessage ?? "");
      }
    });
  }, [user]);

  if (status !== "authenticated") {
    return null;
  }

  const displayAddress = zonecode && address ? `(${zonecode}) ${address}` : "";
  const canSubmit =
    recipientName.trim().length > 0 &&
    zonecode.length > 0 &&
    address.length > 0 &&
    addressDetail.trim().length > 0 &&
    !submitting;

  const handleGoToConfirm = () => {
    if (items.length === 0) return;
    setActionError(null);
    setStep("confirm");
  };

  // 카드 결제는 PG사 결제창에서 처리한다 — 카드 정보를 우리 쪽에 등록/보관하지 않는다.
  const handleConfirmPay = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setActionError(null);
    try {
      let prepared = preparedPayment;
      if (!prepared) {
        const shipping: ShippingInfoRequest = {
          recipientName: recipientName.trim(),
          shippingMethod: "PARCEL",
          zonecode,
          address,
          addressDetail: addressDetail.trim(),
          deliveryMessage: deliveryMessage.trim() || undefined,
        };
        const order = await createGoodsOrder({
          items: items.map((i) => ({ goodsId: i.goodsId, variantId: i.variantId, quantity: i.quantity })),
          shipping,
        });
        prepared = await prepareGoodsPayment(order.orderId);
        setPreparedPayment(prepared);
      }

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
            orderId: prepared.orderId,
            authKey: result.PCD_AUTH_KEY,
            payReqKey: result.PCD_PAY_REQKEY,
          });
        } catch {
          // 응답 유실 가능성이 있으므로 같은 주문번호를 결과 화면에서 계속 조회한다.
        }
        router.replace(`/payments/result?orderId=${encodeURIComponent(prepared.orderId)}`);
      };

      sessionStorage.setItem("remy:lastPaymentOrderId", prepared.orderId);
      sessionStorage.setItem("remy:lastPaymentTarget", "GOODS_ORDER");
      await openPaypleCheckout(prepared, handlePaypleResult);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "주문 처리 중 문제가 발생했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-[130px]">
      <TopBarSub
        title={step === "cart" ? "장바구니" : "굿즈 확정하기"}
        icon={step === "cart" ? "back" : "x"}
        href="/goods"
      />

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
        <>
          <section className="px-4 pt-6">
            <FieldLabel>주문내역</FieldLabel>
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
          </section>

          <div className="mx-4 mt-7 border-t border-line" />

          <section className="px-4 pt-6">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FieldLabel>
                  수령인 <span className="text-soft">(필수)</span>
                </FieldLabel>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="h-[50px] w-full rounded border border-line px-4 text-xs font-extrabold outline-none placeholder:font-normal placeholder:text-soft"
                />
              </div>
              <div>
                <FieldLabel>
                  배송방법 <span className="text-soft">(필수)</span>
                </FieldLabel>
                <div className="flex h-[50px] w-full items-center justify-center rounded border border-black bg-white text-xs font-extrabold">
                  택배 발송
                </div>
              </div>
            </div>

            <div className="mt-6">
              <FieldLabel>
                배송지 입력 <span className="text-soft">(필수)</span>
              </FieldLabel>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={displayAddress}
                  onClick={() => setShowAddressSearch(true)}
                  placeholder="주소를 검색하세요"
                  className="h-[50px] w-full cursor-pointer rounded border border-line pl-4 pr-[76px] text-xs outline-none placeholder:text-soft"
                />
                <button
                  type="button"
                  onClick={() => setShowAddressSearch(true)}
                  className="absolute right-2 top-1/2 h-[34px] w-[60px] -translate-y-1/2 rounded-[5px] bg-black text-xs font-extrabold text-white"
                >
                  검색
                </button>
              </div>
              <input
                type="text"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="상세 주소를 입력하세요"
                className="mt-2 h-[50px] w-full rounded border border-line px-4 text-xs outline-none placeholder:text-soft"
              />
            </div>

            <div className="mt-6">
              <FieldLabel>
                배송 메시지 <span className="text-soft">(선택)</span>
              </FieldLabel>
              <input
                type="text"
                value={deliveryMessage}
                onChange={(e) => setDeliveryMessage(e.target.value)}
                placeholder="배송 시 전달하실 메시지를 남기세요. (예 : 공동현관문 번호..)"
                className="h-[50px] w-full rounded border border-line px-4 text-xs outline-none placeholder:text-soft"
              />
            </div>

            {actionError && <p className="mt-4 text-xs font-bold text-primary">{actionError}</p>}
          </section>
        </>
      )}

      {step === "cart" ? (
        <BottomCTA label="결제하기" onClick={handleGoToConfirm} disabled={items.length === 0} />
      ) : (
        <BottomCTA
          label={submitting ? "결제 처리 중..." : "카드 결제하기"}
          onClick={handleConfirmPay}
          disabled={!canSubmit}
        />
      )}

      {showAddressSearch && (
        <AddressSearchOverlay
          onComplete={(result) => {
            setZonecode(result.zonecode);
            setAddress(result.address);
            setShowAddressSearch(false);
          }}
          onClose={() => setShowAddressSearch(false)}
        />
      )}
    </div>
  );
}
