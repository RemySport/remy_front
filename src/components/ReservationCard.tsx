import type { ReservationSummary } from "@/lib/api/reservations";
import { formatKoreanDate, formatTime } from "@/lib/format";
import { ClockIcon } from "./icons";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "결제 대기",
  PAID: "예약 완료",
  CANCELLED: "취소됨",
  COMPLETED: "관람 완료",
};

export default function ReservationCard({
  reservation,
  onCancel,
  cancelling,
}: {
  reservation: ReservationSummary;
  onCancel?: (reservationId: number) => void;
  cancelling?: boolean;
}) {
  const canCancel = reservation.status === "PENDING" || reservation.status === "PAID";

  return (
    <article className="rounded-md border border-line bg-white px-[11px] py-[14px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold">{formatKoreanDate(reservation.date)}</span>
        <span className="rounded-full bg-[#F4F4F4] px-3 py-1 text-[10px] font-bold text-soft">
          {STATUS_LABEL[reservation.status] ?? reservation.status}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-extrabold leading-[18px]">{reservation.title}</h3>
      <div className="mt-3 flex items-center justify-between text-[10px] text-soft">
        <span className="flex items-center gap-[7px]">
          <ClockIcon className="h-[10px] w-[10px] text-black" />
          {formatTime(reservation.date)}
        </span>
        {reservation.seatNumbers && reservation.seatNumbers.length > 0 && (
          <span>좌석 {reservation.seatNumbers.join(", ")}</span>
        )}
      </div>
      {canCancel && onCancel && (
        <button
          type="button"
          onClick={() => onCancel(reservation.reservationId)}
          disabled={cancelling}
          className="mt-4 h-9 w-full rounded-[10px] border border-line text-xs font-bold disabled:opacity-50"
        >
          {cancelling ? "취소 처리 중..." : "예약 취소"}
        </button>
      )}
    </article>
  );
}
