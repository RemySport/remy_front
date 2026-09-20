import type { ReservationSummary } from "@/lib/api/reservations";
import { formatKoreanDate, formatTime } from "@/lib/format";
import { ClockIcon } from "./icons";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "결제 대기",
  PAYING: "결제 진행 중",
  PAID: "결제 완료 · 확정 대기",
  CONFIRMING: "현지 확인 중",
  CONFIRMED: "예약 확정",
  SEAT_ASSIGNED: "좌석 배정 완료",
  CANCELLED: "취소됨",
  COMPLETED: "관람 완료",
  CANCELLING: "환불 처리 중",
  CANCEL_IN_DOUBT: "환불 확인 중",
};

export default function ReservationCard({
  reservation,
  onCancel,
  cancelling,
}: {
  reservation: ReservationSummary;
  onCancel?: (reservationId: number, status: string) => void;
  cancelling?: boolean;
}) {
  const refundPending = reservation.paymentStatus === "CANCELLING" ||
    reservation.paymentStatus === "CANCEL_IN_DOUBT";
  const canCancel = reservation.status === "PENDING" ||
    (reservation.status === "PAID" && reservation.paymentStatus === "PAID");
  const displayStatus = refundPending ? reservation.paymentStatus! : reservation.status;

  return (
    <article className="rounded-md border border-line bg-white px-[11px] py-[14px]">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-extrabold">{formatKoreanDate(reservation.date)}</span>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-[#F4F4F4] px-3 py-1 text-[10px] font-bold text-soft">
          {STATUS_LABEL[displayStatus] ?? displayStatus}
        </span>
      </div>
      <h3 className="mt-3 break-words text-sm font-extrabold leading-[18px]">{reservation.title}</h3>
      {reservation.paymentMethod && (
        <p className="mt-2 text-[10px] text-soft">
          결제수단: {reservation.paymentMethod === "TRANSFER" ? "계좌결제" : "카드"}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-soft">
        <span className="flex shrink-0 items-center gap-[7px] whitespace-nowrap">
          <ClockIcon className="h-[10px] w-[10px] shrink-0 text-black" />
          {formatTime(reservation.date)}
        </span>
        {reservation.seatNumbers && reservation.seatNumbers.length > 0 && (
          <span className="truncate">좌석 {reservation.seatNumbers.join(", ")}</span>
        )}
      </div>
      {canCancel && onCancel && (
        <button
          type="button"
          onClick={() => onCancel(reservation.reservationId, reservation.status)}
          disabled={cancelling}
          className="mt-4 h-9 w-full rounded-[10px] border border-line text-xs font-bold disabled:opacity-50"
        >
          {cancelling ? "취소 처리 중..." : reservation.status === "PAID" ? "결제 취소 및 전액 환불" : "예약 취소"}
        </button>
      )}
      {refundPending && (
        <p className="mt-4 text-center text-[11px] leading-5 text-soft">
          결제 취소 결과를 확인하고 있습니다. 중복으로 요청하지 마세요.
        </p>
      )}
    </article>
  );
}
