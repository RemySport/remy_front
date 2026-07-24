import { apiFetch } from "./client";

export type UserInfoResponse = {
  email: string;
  nickname: string;
  phoneNumber: string | null;
  joinDate: string | null;
};

export type UpdateMeResponse = {
  email: string;
  nickname: string;
  phoneNumber: string | null;
};

export type PaymentMethodResponse = {
  paymentMethodId: number;
  type: string;
  cardCompany: string | null;
  cardNumberMasked: string | null;
  bankName: string | null;
  accountNumberMasked: string | null;
  isDefault: boolean;
};

export type RegisterPaymentMethodRequest = {
  type: string;
  cardNumber?: string;
  expiryDate?: string;
  cardCompany?: string;
  isDefault?: boolean;
};

export type MyTeamResponse = {
  teamId: number;
  teamName: string;
  leagueName: string | null;
  logoUrl: string | null;
} | null;

export function getMe(): Promise<UserInfoResponse> {
  return apiFetch<UserInfoResponse>("/users/me");
}

export function updateMe(request: { nickname?: string; phoneNumber?: string }): Promise<UpdateMeResponse> {
  return apiFetch<UpdateMeResponse>("/users/me", { method: "PATCH", body: request });
}

export function getPaymentMethods(): Promise<PaymentMethodResponse[]> {
  return apiFetch<PaymentMethodResponse[]>("/users/me/payment-methods");
}

export function registerPaymentMethod(
  request: RegisterPaymentMethodRequest
): Promise<{ paymentMethodId: number; message: string }> {
  return apiFetch("/users/me/payment-methods", { method: "POST", body: request });
}

export function deletePaymentMethod(paymentMethodId: number): Promise<string> {
  return apiFetch<string>(`/users/me/payment-methods/${paymentMethodId}`, { method: "DELETE" });
}

export function getMyTeam(): Promise<MyTeamResponse> {
  return apiFetch<MyTeamResponse>("/users/me/my-team");
}

export function setMyTeam(teamId: number): Promise<MyTeamResponse> {
  return apiFetch<MyTeamResponse>("/users/me/my-team", { method: "PUT", body: { teamId } });
}
