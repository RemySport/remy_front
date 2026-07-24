"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopBarSub from "@/components/TopBarSub";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  getGoods,
  getGoodsList,
  type GoodsDetailResponse,
  type GoodsSummary,
} from "@/lib/api/goods";
import { ApiError } from "@/lib/api/client";

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
    <div className="pb-16">
      <TopBarSub title="굿즈" icon="back" href="/menu" />
      <div className="grid grid-cols-2 gap-4 px-4 pt-6">
        {error && <p className="col-span-2 text-center text-xs text-soft">{error}</p>}
        {!error && goods === null && <p className="col-span-2 text-center text-xs text-soft">불러오는 중...</p>}
        {(goods ?? []).map((g) => (
          <Link key={g.goodsId} href={`/goods?goodsId=${g.goodsId}`} className="block">
            <div className="relative aspect-square overflow-hidden rounded border border-line bg-white">
              <ImageWithFallback src={g.thumbnailUrl} alt={g.name} className="h-full w-full object-cover" />
              {g.isSoldOut && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-bold text-white">
                  품절
                </span>
              )}
            </div>
            <p className="mt-2 text-xs font-bold">{g.name}</p>
            <p className="text-xs text-soft">{g.price.toLocaleString("ko-KR")}원</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function GoodsDetailView({ goodsId }: { goodsId: string }) {
  const [detail, setDetail] = useState<GoodsDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGoods(goodsId)
      .then(setDetail)
      .catch((e) => setError(e instanceof ApiError ? e.message : "굿즈 정보를 불러오지 못했습니다."));
  }, [goodsId]);

  return (
    <div className="pb-16">
      <TopBarSub title="굿즈 상세" icon="back" href="/goods" />
      {error && <p className="px-4 pt-6 text-center text-xs text-soft">{error}</p>}
      {!error && !detail && <p className="px-4 pt-6 text-center text-xs text-soft">불러오는 중...</p>}
      {detail && (
        <div className="px-4 pt-6">
          <div className="aspect-square overflow-hidden rounded border border-line bg-white">
            <ImageWithFallback src={detail.imageUrls[0]} alt={detail.name} className="h-full w-full object-cover" />
          </div>
          <h2 className="mt-4 text-base font-extrabold">{detail.name}</h2>
          <p className="mt-2 text-sm font-bold text-primary">{detail.price.toLocaleString("ko-KR")}원</p>
          <p className="mt-3 text-xs text-soft">{detail.description}</p>
          {detail.options.map((opt) => (
            <div key={opt.optionId} className="mt-4">
              <p className="text-xs font-bold">{opt.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {opt.values.map((v) => (
                  <span key={v} className="rounded border border-line px-3 py-1 text-xs">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {detail.stock !== null && <p className="mt-4 text-xs text-soft">재고: {detail.stock}개</p>}
        </div>
      )}
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
