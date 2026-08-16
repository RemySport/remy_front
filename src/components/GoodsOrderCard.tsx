import type { GoodsOrderSummary } from "@/lib/api/goodsOrders";
import { formatKoreanDate, formatPrice } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "결제 대기",
  PAID: "주문 완료",
  CANCELLED: "취소됨",
  COMPLETED: "배송 완료",
};

export default function GoodsOrderCard({
  order,
  onCancel,
  cancelling,
}: {
  order: GoodsOrderSummary;
  onCancel?: (orderId: number) => void;
  cancelling?: boolean;
}) {
  const canCancel = order.status === "PENDING" || order.status === "PAID";

  return (
    <article className="rounded-md border border-line bg-white px-[11px] py-[14px]">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-extrabold">{formatKoreanDate(order.orderedAt)}</span>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-[#F4F4F4] px-3 py-1 text-[10px] font-bold text-soft">
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        {order.items.map((item, idx) => (
          <div key={`${item.goodsId}-${idx}`} className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate">
              {item.name}
              {item.optionLabel ? ` (${item.optionLabel})` : ""} × {item.quantity}
            </span>
            <span className="shrink-0 font-bold">{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs">
        <span className="text-soft">총 결제 금액</span>
        <span className="font-extrabold">{formatPrice(order.totalAmount)}</span>
      </div>

      {canCancel && onCancel && (
        <button
          type="button"
          onClick={() => onCancel(order.orderId)}
          disabled={cancelling}
          className="mt-4 h-9 w-full rounded-[10px] border border-line text-xs font-bold disabled:opacity-50"
        >
          {cancelling ? "취소 처리 중..." : "주문 취소"}
        </button>
      )}
    </article>
  );
}
