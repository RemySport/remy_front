import { apiFetch } from "./client";

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

export function pay(request: {
  reservationId: number;
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
