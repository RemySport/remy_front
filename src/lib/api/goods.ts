import { apiFetch, buildQuery } from "./client";

export type GoodsSummary = {
  goodsId: number;
  name: string;
  price: number;
  thumbnailUrl: string | null;
  isSoldOut: boolean;
};

export type GoodsListResponse = {
  totalElements: number;
  goodsList: GoodsSummary[];
};

export type GoodsOptionValue = {
  valueId: number;
  value: string;
};

export type GoodsOption = {
  optionId: number;
  name: string;
  values: GoodsOptionValue[];
};

/** 옵션 조합(사이즈/컬러 등) 단위 재고. 재고는 상품 전체가 아니라 이 조합 단위로만 존재한다. */
export type GoodsVariant = {
  variantId: number;
  /** 각 옵션 그룹에서 선택된 GoodsOptionValue.valueId 조합 (예: [사이즈:M, 컬러:레드]) */
  optionValueIds: number[];
  stock: number;
};

export type GoodsDetailResponse = {
  goodsId: number;
  name: string;
  description: string | null;
  price: number;
  imageUrls: string[];
  options: GoodsOption[];
  variants: GoodsVariant[];
};

export function getGoodsList(params: { page?: number; size?: number; sort?: string } = {}): Promise<GoodsListResponse> {
  return apiFetch<GoodsListResponse>(`/goods${buildQuery(params)}`, { auth: false });
}

export function getGoods(goodsId: number | string): Promise<GoodsDetailResponse> {
  return apiFetch<GoodsDetailResponse>(`/goods/${goodsId}`, { auth: false });
}
