"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopBarMain from "@/components/TopBarMain";
import TopBarSub from "@/components/TopBarSub";
import BottomNav from "@/components/BottomNav";
import BottomCTA from "@/components/BottomCTA";
import SectionTitle from "@/components/SectionTitle";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import CartFabButton from "@/components/CartFabButton";
import ImageWithFallback from "@/components/ImageWithFallback";
import { MinusIcon, PlusIcon } from "@/components/icons";
import {
  getGoods,
  getGoodsList,
  type GoodsDetailResponse,
  type GoodsSummary,
} from "@/lib/api/goods";
import { ApiError } from "@/lib/api/client";
import { useCart } from "@/lib/cart/CartContext";

function LoadingMessage() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-sm text-soft">불러오는 중...</p>
    </div>
  );
}

function GoodsListView() {
  const [goods, setGoods] = useState<GoodsSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGoodsList({ size: 50 })
      .then((res) => setGoods(res.goodsList))
      .catch((e) => setError(e instanceof ApiError ? e.message : "굿즈 목록을 불러오지 못했습니다."));
  }, []);

  return (
    <div className="pb-[130px]">
      <TopBarMain />

      <section className="px-4 pt-7">
        <SectionTitle label="굿즈" title="우리 팀 굿즈를 만나보세요." />
      </section>

      <div className="grid grid-cols-2 gap-4 px-4 pt-7">
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
            <p className="mt-2 line-clamp-2 break-words text-xs font-bold">{g.name}</p>
            <p className="truncate text-xs text-soft">{g.price.toLocaleString("ko-KR")}원</p>
          </Link>
        ))}
      </div>

      <ScrollToTopButton />
      <BottomNav active="goods" showCart />
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
      .then(setDetail)
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
        price: detail.price,
        thumbnailUrl: detail.imageUrls[0] ?? null,
        stock: selectedVariant.stock,
      },
      quantity
    );
    setAdded(true);
  };

  return (
    <div className="pb-[130px]">
      <TopBarSub title="굿즈 상세" icon="back" href="/goods" />
      {error && <p className="px-4 pt-6 text-center text-xs text-soft">{error}</p>}
      {!error && !detail && <p className="px-4 pt-6 text-center text-xs text-soft">불러오는 중...</p>}
      {detail && (
        <div className="px-4 pt-6">
          <div className="aspect-square overflow-hidden rounded border border-line bg-white">
            <ImageWithFallback src={detail.imageUrls[0]} alt={detail.name} className="h-full w-full object-cover" />
          </div>
          <h2 className="mt-4 break-words text-base font-extrabold">{detail.name}</h2>
          <p className="mt-2 text-sm font-bold text-primary">{detail.price.toLocaleString("ko-KR")}원</p>
          <p className="mt-3 break-words text-xs text-soft">{detail.description}</p>

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
