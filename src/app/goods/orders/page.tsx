"use client";

import { useEffect, useState } from "react";
import TopBarSub from "@/components/TopBarSub";
import BottomNav from "@/components/BottomNav";
import SectionTitle from "@/components/SectionTitle";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import GoodsOrderCard from "@/components/GoodsOrderCard";
import { cancelGoodsOrder, getGoodsOrders, type GoodsOrderSummary } from "@/lib/api/goodsOrders";
import { ApiError } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

export default function GoodsOrdersPage() {
  const status = useRequireAuth();
  const [orders, setOrders] = useState<GoodsOrderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    getGoodsOrders({ size: 50 })
      .then((res) => setOrders(res.orders))
      .catch((e) => setError(e instanceof ApiError ? e.message : "주문 내역을 불러오지 못했습니다."));
  }, [status]);

  const handleCancel = async (orderId: number) => {
    setCancellingId(orderId);
    try {
      await cancelGoodsOrder(orderId);
      setOrders((prev) => prev?.filter((o) => o.orderId !== orderId) ?? null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "주문 취소 중 문제가 발생했습니다.");
    } finally {
      setCancellingId(null);
    }
  };

  if (status !== "authenticated") return null;

  return (
    <div className="pb-[130px]">
      <TopBarSub title="굿즈 주문내역" icon="back" href="/goods" />

      <section className="px-4 pt-7">
        <SectionTitle label="굿즈 주문내역" title="주문하신 굿즈 내역입니다." />
      </section>

      <div className="mt-8 space-y-5 px-4">
        {error && <p className="text-center text-xs text-soft">{error}</p>}
        {!error && orders === null && <p className="text-center text-xs text-soft">불러오는 중...</p>}
        {!error && orders !== null && orders.length === 0 && (
          <p className="text-center text-xs text-soft">주문 내역이 없습니다.</p>
        )}
        {(orders ?? []).map((o) => (
          <GoodsOrderCard
            key={o.orderId}
            order={o}
            onCancel={handleCancel}
            cancelling={cancellingId === o.orderId}
          />
        ))}
      </div>

      <ScrollToTopButton />
      <BottomNav active="goods" />
    </div>
  );
}
