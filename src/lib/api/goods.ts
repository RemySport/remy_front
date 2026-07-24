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

export type GoodsOption = {
  optionId: number;
  name: string;
  values: string[];
};

export type GoodsDetailResponse = {
  goodsId: number;
  name: string;
  description: string | null;
  price: number;
  imageUrls: string[];
  options: GoodsOption[];
  stock: number | null;
};

export function getGoodsList(params: { page?: number; size?: number; sort?: string } = {}): Promise<GoodsListResponse> {
  return apiFetch<GoodsListResponse>(`/goods${buildQuery(params)}`, { auth: false });
}

export function getGoods(goodsId: number | string): Promise<GoodsDetailResponse> {
  return apiFetch<GoodsDetailResponse>(`/goods/${goodsId}`, { auth: false });
}
