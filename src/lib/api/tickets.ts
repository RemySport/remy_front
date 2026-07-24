import { apiFetch, buildQuery } from "./client";

export type TeamBrief = {
  teamId: number;
  name: string;
  logoUrl: string | null;
} | null;

export type StadiumBrief = {
  name: string;
  city: string | null;
  country: string | null;
} | null;

export type TicketSummary = {
  ticketId: number;
  title: string;
  date: string | null;
  price: number | null;
  thumbnailUrl: string | null;
  status: string;
  leagueName: string | null;
  competitionType: string | null;
  home: TeamBrief;
  away: TeamBrief;
  stadium: StadiumBrief;
};

export type PriceInfo = {
  grade: string;
  price: number;
};

export type TicketDetailResponse = {
  ticketId: number;
  title: string;
  date: string | null;
  place: string | null;
  runningTime: number | null;
  ageLimit: string | null;
  priceInfo: PriceInfo[];
  detailImages: string[];
  status: string;
  leagueName: string | null;
  competitionType: string | null;
  home: TeamBrief;
  away: TeamBrief;
  stadium: StadiumBrief;
};

export type TicketListResponse = {
  totalElements: number;
  totalPages: number;
  tickets: TicketSummary[];
};

export function getTickets(params: { keyword?: string; page?: number; size?: number } = {}): Promise<TicketListResponse> {
  return apiFetch<TicketListResponse>(`/tickets${buildQuery(params)}`, { auth: false });
}

export function getTicket(ticketId: number | string): Promise<TicketDetailResponse> {
  return apiFetch<TicketDetailResponse>(`/tickets/${ticketId}`, { auth: false });
}
