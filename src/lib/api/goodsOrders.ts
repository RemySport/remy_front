import { apiFetch, buildQuery } from "./client";

export type GoodsOrderItemRequest = {
  goodsId: number;
  variantId: number;
  quantity: number;
};

/** 현재는 택배 발송만 지원한다 (Figma "굿즈 확정하기" 배송방법 옵션이 택배 발송 하나뿐). */
export type ShippingMethod = "PARCEL";

export type ShippingInfoRequest = {
  recipientName: string;
  shippingMethod: ShippingMethod;
  /** 우편번호 (5자리). 카카오(다음) 우편번호 검색 결과의 zonecode. */
  zonecode: string;
  /** 검색으로 채워지는 도로명/지번 주소. */
  address: string;
  /** 사용자가 직접 입력하는 상세 주소. */
  addressDetail: string;
  /** 배송 메시지 (선택). */
  deliveryMessage?: string;
};

export type ShippingInfoResponse = ShippingInfoRequest;

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
  /** 예전에 생성된 주문에는 배송지 정보가 없을 수 있어 optional. */
  shipping?: ShippingInfoResponse | null;
};

export type GoodsOrderListResponse = {
  totalElements: number;
  orders: GoodsOrderSummary[];
};

export type CancelGoodsOrderResponse = {
  orderId: number;
  status: string;
};

export function createGoodsOrder(request: {
  items: GoodsOrderItemRequest[];
  shipping: ShippingInfoRequest;
}): Promise<CreateGoodsOrderResponse> {
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
