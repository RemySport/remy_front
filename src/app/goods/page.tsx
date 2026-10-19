"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import TopBarMain from "@/components/TopBarMain";
import TopBarSub from "@/components/TopBarSub";
import BottomNav from "@/components/BottomNav";
import BottomCTA from "@/components/BottomCTA";
import SectionTitle from "@/components/SectionTitle";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import CartFabButton from "@/components/CartFabButton";
import ImageWithFallback from "@/components/ImageWithFallback";
import GoodsTaxonomyNav, { AXIS_ORDER, type GoodsAxis, type GoodsTab } from "@/components/GoodsTaxonomyNav";
import { MinusIcon, PlusIcon } from "@/components/icons";
import {
  getGoods,
  getGoodsList,
  type GoodsDetailResponse,
  type GoodsFilter,
  type GoodsSummary,
} from "@/lib/api/goods";
import { ApiError } from "@/lib/api/client";
import { useCart } from "@/lib/cart/CartContext";

const PAGE_SIZE = 20;

function LoadingMessage() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-sm text-soft">불러오는 중...</p>
    </div>
  );
}

function parseId(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function GoodsListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 탭과 선택값은 URL(?tab=club&brand=1&club=2&category=3)에 둔다 — 새로고침·뒤로가기·공유 링크에서도 유지된다.
  const tab: GoodsTab = searchParams.get("tab") === "club" ? "club" : "brand";
  const brand = parseId(searchParams.get("brand"));
  const club = parseId(searchParams.get("club"));
  const category = parseId(searchParams.get("category"));
  const filter: GoodsFilter = useMemo(() => ({ brand, club, category }), [brand, club, category]);
  const filterKey = `${brand ?? ""}|${club ?? ""}|${category ?? ""}`;

  // 결과를 필터 키와 함께 저장해, 필터가 바뀌면 이전 결과 대신 "불러오는 중"이 보이게 한다.
  const [result, setResult] = useState<{ key: string; goods: GoodsSummary[]; total: number; page: number } | null>(
    null
  );
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getGoodsList({ ...filter, page: 1, size: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) setResult({ key: filterKey, goods: res.goodsList, total: res.totalElements, page: 1 });
      })
      .catch((e) => {
        if (!cancelled)
          setFailure({
            key: filterKey,
            message: e instanceof ApiError ? e.message : "굿즈 목록을 불러오지 못했습니다.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [filter, filterKey]);

  const current = result?.key === filterKey ? result : null;
  const goods = current?.goods ?? null;
  const total = current?.total ?? 0;
  const error = failure?.key === filterKey ? failure.message : null;

  const loadMore = () => {
    if (!current) return;
    const key = current.key;
    const next = current.page + 1;
    setLoadingMore(true);
    getGoodsList({ ...filter, page: next, size: PAGE_SIZE })
      .then((res) =>
        setResult((prev) =>
          prev && prev.key === key
            ? { key, goods: [...prev.goods, ...res.goodsList], total: res.totalElements, page: next }
            : prev
        )
      )
      .catch((e) =>
        setFailure({ key, message: e instanceof ApiError ? e.message : "굿즈 목록을 불러오지 못했습니다." })
      )
      .finally(() => setLoadingMore(false));
  };

  const navigate = (nextTab: GoodsTab, nextFilter: GoodsFilter) => {
    const params = new URLSearchParams();
    if (nextTab === "club") params.set("tab", "club");
    for (const axis of ["brand", "club", "category"] as const) {
      const id = nextFilter[axis];
      if (id != null) params.set(axis, String(id));
    }
    const qs = params.toString();
    router.replace(qs ? `/goods?${qs}` : "/goods", { scroll: false });
  };

  // 한 단계를 바꾸면 그 아래 단계 선택은 초기화한다.
  const handleSelect = (axis: GoodsAxis, id: number | null) => {
    const order = AXIS_ORDER[tab];
    const level = order.indexOf(axis);
    const next: GoodsFilter = {};
    for (const a of order.slice(0, level)) next[a] = filter[a];
    next[axis] = id;
    navigate(tab, next);
  };

  return (
    <div className="pb-[130px]">
      <TopBarMain />

      <section className="px-4 pt-7">
        <SectionTitle label="굿즈" title="우리 팀 굿즈를 만나보세요." />
      </section>

      <GoodsTaxonomyNav
        tab={tab}
        filter={filter}
        onTabChange={(nextTab) => navigate(nextTab, {})}
        onSelect={handleSelect}
      />

      <div className="grid grid-cols-2 gap-4 px-4 pt-6">
        {error && <p className="col-span-2 text-center text-xs text-soft">{error}</p>}
        {!error && goods === null && <p className="col-span-2 text-center text-xs text-soft">불러오는 중...</p>}
        {!error && goods !== null && goods.length === 0 && (
          <p className="col-span-2 text-center text-xs text-soft">등록된 굿즈가 없습니다.</p>
        )}
        {(goods ?? []).map((g) => (
          <Link key={g.goodsId} href={`/goods?goodsId=${g.goodsId}`} className="block min-w-0">
            <div className="relative aspect-square overflow-hidden rounded border border-line bg-white">
              <ImageWithFallback src={g.thumbnailUrl} alt={g.name} className="h-full w-full object-cover" />
              {g.isSoldOut && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-bold text-white">
                  품절
                </span>
              )}
            </div>
            {g.taxonomy?.brandName && <p className="mt-2 truncate text-[10px] text-soft">{g.taxonomy.brandName}</p>}
            <p className={`${g.taxonomy?.brandName ? "mt-0.5" : "mt-2"} line-clamp-2 break-words text-xs font-bold`}>
              {g.name}
            </p>
            {g.discountRate > 0 ? (
              <p className="truncate text-xs">
                <span className="font-bold text-primary">{g.discountRate}%</span>{" "}
                <span className="font-bold">{g.salePrice.toLocaleString("ko-KR")}원</span>{" "}
                <span className="text-[10px] text-soft line-through">{g.price.toLocaleString("ko-KR")}원</span>
              </p>
            ) : (
              <p className="truncate text-xs text-soft">{g.price.toLocaleString("ko-KR")}원</p>
            )}
          </Link>
        ))}
      </div>

      {!error && goods !== null && goods.length < total && (
        <div className="px-4 pt-6">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="h-11 w-full rounded border border-line bg-white text-xs font-bold disabled:opacity-40"
          >
            {loadingMore ? "불러오는 중..." : `더보기 (${goods.length}/${total})`}
          </button>
        </div>
      )}

      <ScrollToTopButton />
      <BottomNav active="goods" showCart />
    </div>
  );
}

/** 상품 이미지 여러 장을 가로로 넘겨 본다. 한 장이면 그대로 보여준다. */
function ImageGallery({ urls, alt }: { urls: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  if (urls.length <= 1) {
    return (
      <div className="aspect-square overflow-hidden rounded border border-line bg-white">
        <ImageWithFallback src={urls[0]} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className="relative">
      <div
        className="flex snap-x snap-mandatory overflow-x-auto rounded border border-line bg-white [scrollbar-width:none]"
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {urls.map((url, i) => (
          <div key={url} className="aspect-square w-full shrink-0 snap-center">
            <ImageWithFallback src={url} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
      <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
        {index + 1} / {urls.length}
      </span>
    </div>
  );
}

function GoodsDetailView({ goodsId }: { goodsId: string }) {
  const { addItem } = useCart();
  const [detail, setDetail] = useState<GoodsDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getGoods(goodsId)
      .then((next) => {
        setDetail(next);
        const automatic: Record<number, number> = {};
        for (const option of next.options) {
          const available = option.values.filter((value) =>
            next.variants.some((variant) => variant.stock > 0 && variant.optionValueIds.includes(value.valueId))
          );
          if (available.length === 1) automatic[option.optionId] = available[0].valueId;
        }
        setSelected(automatic);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "굿즈 정보를 불러오지 못했습니다."));
  }, [goodsId]);

  const allOptionsSelected = detail ? detail.options.every((opt) => selected[opt.optionId] !== undefined) : false;

  const selectedVariant = useMemo(() => {
    if (!detail || !allOptionsSelected) return null;
    const wanted = Object.values(selected);
    return (
      detail.variants.find(
        (v) => v.optionValueIds.length === wanted.length && wanted.every((id) => v.optionValueIds.includes(id))
      ) ?? null
    );
  }, [detail, selected, allOptionsSelected]);

  // 특정 옵션 값을 포함한 variant가 전부 품절이면(재고 0) 그 값은 애초에 고를 수 없게 막는다.
  const isValueOutOfStock = (valueId: number) => {
    if (!detail) return false;
    const relevant = detail.variants.filter((v) => v.optionValueIds.includes(valueId));
    return relevant.length > 0 && relevant.every((v) => v.stock <= 0);
  };

  const handleSelect = (optionId: number, valueId: number) => {
    setSelected((prev) => ({ ...prev, [optionId]: valueId }));
    setQuantity(1);
    setAdded(false);
  };

  const handleAddToCart = () => {
    if (!detail || !selectedVariant || selectedVariant.stock <= 0) return;
    const optionLabel = detail.options
      .map((opt) => {
        const valueId = selected[opt.optionId];
        const value = opt.values.find((v) => v.valueId === valueId);
        return value ? `${opt.name}: ${value.value}` : null;
      })
      .filter(Boolean)
      .join(" / ");

    addItem(
      {
        goodsId: detail.goodsId,
        variantId: selectedVariant.variantId,
        name: detail.name,
        optionLabel,
        price: detail.discountRate > 0 ? detail.salePrice : detail.price,
        thumbnailUrl: detail.imageUrls[0] ?? null,
        stock: selectedVariant.stock,
      },
      quantity
    );
    setAdded(true);
  };

  const taxonomyLine = [detail?.taxonomy?.brandName, detail?.taxonomy?.clubName].filter(Boolean).join(" · ");

  return (
    <div className="pb-[130px]">
      <TopBarSub title="굿즈 상세" icon="back" href="/goods" />
      {error && <p className="px-4 pt-6 text-center text-xs text-soft">{error}</p>}
      {!error && !detail && <p className="px-4 pt-6 text-center text-xs text-soft">불러오는 중...</p>}
      {detail && (
        <div className="px-4 pt-6">
          <ImageGallery urls={detail.imageUrls} alt={detail.name} />
          {taxonomyLine && <p className="mt-4 break-words text-xs text-soft">{taxonomyLine}</p>}
          <h2 className={`${taxonomyLine ? "mt-1" : "mt-4"} break-words text-base font-extrabold`}>{detail.name}</h2>
          {detail.discountRate > 0 ? (
            <div className="mt-2">
              <p className="text-xs text-soft line-through">{detail.price.toLocaleString("ko-KR")}원</p>
              <p className="text-sm font-bold">
                <span className="text-primary">{detail.discountRate}%</span>{" "}
                {detail.salePrice.toLocaleString("ko-KR")}원
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm font-bold text-primary">{detail.price.toLocaleString("ko-KR")}원</p>
          )}
          <p className="mt-3 whitespace-pre-line break-words text-xs text-soft">{detail.description}</p>

          {detail.options.map((opt) => (
            <div key={opt.optionId} className="mt-4">
              <p className="break-words text-xs font-bold">{opt.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {opt.values.map((v) => {
                  const isSelected = selected[opt.optionId] === v.valueId;
                  const outOfStock = isValueOutOfStock(v.valueId);
                  return (
                    <button
                      key={v.valueId}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => handleSelect(opt.optionId, v.valueId)}
                      className={`max-w-full break-words rounded border px-3 py-1 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
                        isSelected ? "border-primary bg-primary text-white" : "border-line bg-white text-black"
                      }`}
                    >
                      {v.value}
                      {outOfStock && " (품절)"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {allOptionsSelected && (
            <p className="mt-4 text-xs text-soft">
              {selectedVariant && selectedVariant.stock > 0 ? (
                `재고 ${selectedVariant.stock}개`
              ) : (
                <span className="font-bold text-primary">선택하신 옵션은 품절입니다.</span>
              )}
            </p>
          )}

          {selectedVariant && selectedVariant.stock > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold">수량</p>
              <div className="flex h-11 w-[140px] items-center justify-between border border-black bg-white px-4">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="수량 감소"
                >
                  <MinusIcon className="h-[2px] w-3 text-black" />
                </button>
                <span className="text-xs font-extrabold">{quantity}개</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))}
                  aria-label="수량 증가"
                >
                  <PlusIcon className="h-3 w-3 text-black" />
                </button>
              </div>
            </div>
          )}

          {added && (
            <p className="mt-4 text-xs font-bold">
              장바구니에 담았습니다.{" "}
              <Link href="/cart" className="text-primary underline">
                장바구니 보기
              </Link>
            </p>
          )}
        </div>
      )}

      {detail && (
        <BottomCTA
          label="장바구니 담기"
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock <= 0}
        />
      )}
      <CartFabButton />
    </div>
  );
}

function GoodsPageInner() {
  const searchParams = useSearchParams();
  const goodsId = searchParams.get("goodsId");
  return goodsId ? <GoodsDetailView goodsId={goodsId} /> : <GoodsListView />;
}

export default function GoodsPage() {
  return (
    <Suspense fallback={<LoadingMessage />}>
      <GoodsPageInner />
    </Suspense>
  );
}
