import { apiFetch, buildQuery } from "./client";

export type CreateReservationResponse = {
  reservationId: number;
  status: string;
  expiresAt: string | null;
};

export type ReservationSummary = {
  reservationId: number;
  ticketId: number;
  title: string;
  date: string | null;
  status: string;
  seatNumbers: string[] | null;
};

export type ReservationListResponse = {
  totalElements: number;
  totalPages: number;
  reservations: ReservationSummary[];
};

export type ReservationDetailResponse = {
  reservationId: number;
  ticketId: number;
  title: string;
  date: string | null;
  place: string | null;
  seatNumbers: string[] | null;
  paymentAmount: number | null;
  qrCodeData: string | null;
  status: string;
};

export type CancelReservationResponse = {
  reservationId: number;
  refundAmount: number | null;
  status: string;
};

export function createReservation(request: {
  ticketId: number;
  quantity: number;
  seatNumbers?: string[];
}): Promise<CreateReservationResponse> {
  return apiFetch<CreateReservationResponse>("/reservation", { method: "POST", body: request });
}

export function getReservations(params: { status?: string; page?: number; size?: number } = {}): Promise<ReservationListResponse> {
  return apiFetch<ReservationListResponse>(`/reservations${buildQuery(params)}`);
}

export function getReservation(reservationId: number | string): Promise<ReservationDetailResponse> {
  return apiFetch<ReservationDetailResponse>(`/reservations/${reservationId}`);
}

export function cancelReservation(
  reservationId: number | string,
  cancelReason?: string
): Promise<CancelReservationResponse> {
  return apiFetch<CancelReservationResponse>(`/reservations/${reservationId}/cancel`, {
    method: "PATCH",
    body: cancelReason ? { cancelReason } : undefined,
  });
}
