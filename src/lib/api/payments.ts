import { apiFetch } from "./client";

export type PaymentPrepareResponse = {
  orderId: string;
  amount: number;
  goodsName: string;
  payerName: string;
  payerEmail: string;
  payerHp: string | null;
  holdExpiresAt: string;
  scriptUrl: string;
  checkout: Record<string, string | number>;
};

export type PaymentStatusResponse = {
  orderId: string;
  status: string;
  paidAmount: number | null;
  approvedAt: string | null;
  reservationStatus: string | null;
};

export type PaymentResponse = {
  paymentId: string;
  approvedAt: string | null;
  status: string;
};

export type RefundResponse = {
  refundId: string;
  refundedAmount: number | null;
  status: string;
};

export type PaypleAuthResult = {
  PCD_PAY_RST?: string;
  PCD_PAY_CODE?: string;
  PCD_PAY_MSG?: string;
  PCD_AUTH_KEY?: string;
  PCD_PAY_REQKEY?: string;
  PCD_PAY_OID?: string;
};

declare global {
  interface Window {
    PaypleCpayAuthCheck?: (request: Record<string, unknown>) => void;
  }
}

const ALLOWED_PAYPLE_SCRIPTS = new Set([
  "https://democpay.payple.kr/js/v1/payment.js",
  "https://cpay.payple.kr/js/v1/payment.js",
]);

let paypleScriptPromise: Promise<void> | null = null;

export function preparePayment(reservationId: number): Promise<PaymentPrepareResponse> {
  return apiFetch<PaymentPrepareResponse>("/payments/prepare", {
    method: "POST",
    body: { reservationId },
  });
}

export function payGoodsOrder(request: {
  orderId: number;
  paymentMethodId?: number;
  amount: number;
}): Promise<PaymentResponse> {
  return apiFetch<PaymentResponse>("/payments", { method: "POST", body: request });
}

export function refund(paymentId: string, reason?: string): Promise<RefundResponse> {
  return apiFetch<RefundResponse>(`/payments/${paymentId}/refund`, {
    method: "POST",
    body: reason ? { reason } : undefined,
  });
}

export function approvePayment(request: {
  orderId: string;
  authKey: string;
  payReqKey: string;
}): Promise<PaymentStatusResponse> {
  return apiFetch<PaymentStatusResponse>("/payments/approve", { method: "POST", body: request });
}

export function getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
  return apiFetch<PaymentStatusResponse>(`/payments/${encodeURIComponent(orderId)}`);
}

export function isMobilePaypleFlow(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export async function openPaypleCheckout(
  prepared: PaymentPrepareResponse,
  onResult: (result: PaypleAuthResult) => void
): Promise<void> {
  await loadPaypleScript(prepared.scriptUrl);

  if (!window.PaypleCpayAuthCheck) {
    throw new Error("페이플 결제 모듈을 불러오지 못했습니다.");
  }

  const request: Record<string, unknown> = {
    ...prepared.checkout,
    PCD_PAYER_NAME: prepared.payerName,
    PCD_PAYER_EMAIL: prepared.payerEmail,
    PCD_PAYER_HP: prepared.payerHp ?? "",
  };

  // 모바일은 PCD_RST_URL로 직접 이동하고, PC만 JavaScript callback을 사용한다.
  if (!isMobilePaypleFlow()) {
    request.callbackFunction = onResult;
  }

  window.PaypleCpayAuthCheck(request);
}

function loadPaypleScript(scriptUrl: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("결제창은 브라우저에서만 열 수 있습니다."));
  }

  let normalized: string;
  try {
    normalized = new URL(scriptUrl).href;
  } catch {
    return Promise.reject(new Error("유효하지 않은 결제 모듈 주소입니다."));
  }

  if (!ALLOWED_PAYPLE_SCRIPTS.has(normalized)) {
    return Promise.reject(new Error("허용되지 않은 결제 모듈 주소입니다."));
  }

  if (window.PaypleCpayAuthCheck) return Promise.resolve();
  if (paypleScriptPromise) return paypleScriptPromise;

  paypleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-remy-payple="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("페이플 결제 모듈 로딩에 실패했습니다.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = normalized;
    script.async = true;
    script.dataset.remyPayple = "true";
    script.onload = () => resolve();
    script.onerror = () => {
      paypleScriptPromise = null;
      reject(new Error("페이플 결제 모듈 로딩에 실패했습니다."));
    };
    document.head.appendChild(script);
  });

  return paypleScriptPromise;
}
