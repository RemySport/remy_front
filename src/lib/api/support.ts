import { apiFetch, buildQuery } from "./client";

export type FaqResponse = {
  faqId: number;
  category: string;
  question: string;
  answer: string;
};

export type NoticeSummary = {
  noticeId: number;
  title: string;
  createdAt: string | null;
  isImportant: boolean;
};

export type NoticeListResponse = {
  totalElements: number;
  notices: NoticeSummary[];
};

export function getFaqs(category?: string): Promise<FaqResponse[]> {
  return apiFetch<FaqResponse[]>(`/faqs${buildQuery({ category })}`, { auth: false });
}

export function getNotices(params: { page?: number; size?: number } = {}): Promise<NoticeListResponse> {
  return apiFetch<NoticeListResponse>(`/notices${buildQuery(params)}`, { auth: false });
}
