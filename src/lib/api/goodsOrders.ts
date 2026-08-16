import { apiFetch, buildQuery } from "./client";

export type GoodsOrderItemRequest = {
  goodsId: number;
  variantId: number;
  quantity: number;
};

export type CreateGoodsOrderResponse = {
  orderId: number;
  status: string;
  totalAmount: number;
};

export type GoodsOrderItemSummary = {
  goodsId: number;
  name: string;
  optionLabel: string;
  quantity: number;
  unitPrice: number;
};

export type GoodsOrderSummary = {
  orderId: number;
  items: GoodsOrderItemSummary[];
  totalAmount: number;
  status: string;
  orderedAt: string | null;
};

export type GoodsOrderListResponse = {
  totalElements: number;
  orders: GoodsOrderSummary[];
};

export type CancelGoodsOrderResponse = {
  orderId: number;
  status: string;
};

export function createGoodsOrder(request: { items: GoodsOrderItemRequest[] }): Promise<CreateGoodsOrderResponse> {
  return apiFetch<CreateGoodsOrderResponse>("/goods-order", { method: "POST", body: request });
}

export function getGoodsOrders(
  params: { status?: string; page?: number; size?: number } = {}
): Promise<GoodsOrderListResponse> {
  return apiFetch<GoodsOrderListResponse>(`/goods-orders${buildQuery(params)}`);
}

export function cancelGoodsOrder(orderId: number | string, cancelReason?: string): Promise<CancelGoodsOrderResponse> {
  return apiFetch<CancelGoodsOrderResponse>(`/goods-orders/${orderId}/cancel`, {
    method: "PATCH",
    body: cancelReason ? { cancelReason } : undefined,
  });
}
