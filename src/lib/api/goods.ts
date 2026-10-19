import { apiFetch, buildQuery } from "./client";

/** 상품 분류. 지정되지 않은 축은 null. */
export type GoodsTaxonomy = {
  brandId: number | null;
  brandName: string | null;
  clubId: number | null;
  clubName: string | null;
  categoryId: number | null;
  categoryName: string | null;
};

export type GoodsSummary = {
  goodsId: number;
  name: string;
  /** 정가 */
  price: number;
  /** 할인율(%), 할인 없으면 0 */
  discountRate: number;
  /** 할인 적용 판매가 — 실제 결제 단가 */
  salePrice: number;
  thumbnailUrl: string | null;
  isSoldOut: boolean;
  taxonomy: GoodsTaxonomy | null;
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
  discountRate: number;
  salePrice: number;
  imageUrls: string[];
  options: GoodsOption[];
  variants: GoodsVariant[];
  taxonomy: GoodsTaxonomy | null;
};

/** 분류 필터. 백엔드 쿼리 파라미터 이름(brand/club/category)과 같다. */
export type GoodsFilter = {
  brand?: number | null;
  club?: number | null;
  category?: number | null;
};

export type BrandFacet = { brandId: number; name: string; count: number };
export type ClubFacet = { clubId: number; name: string; league: string | null; count: number };
export type CategoryFacet = { categoryId: number; code: string; name: string; count: number };

/** 축별 판매중 상품 수. 각 축은 자기 축을 뺀 나머지 필터만 적용되고, 0건 항목은 오지 않는다. */
export type GoodsFacetsResponse = {
  brands: BrandFacet[];
  clubs: ClubFacet[];
  categories: CategoryFacet[];
};

export function getGoodsList(
  params: { page?: number; size?: number; sort?: string } & GoodsFilter = {}
): Promise<GoodsListResponse> {
  return apiFetch<GoodsListResponse>(`/goods${buildQuery(params)}`, { auth: false });
}

export function getGoodsFacets(filter: GoodsFilter = {}): Promise<GoodsFacetsResponse> {
  return apiFetch<GoodsFacetsResponse>(`/goods/facets${buildQuery(filter)}`, { auth: false });
}

export function getGoods(goodsId: number | string): Promise<GoodsDetailResponse> {
  return apiFetch<GoodsDetailResponse>(`/goods/${goodsId}`, { auth: false });
}
