import { apiFetch } from "./client";

export type LoginResponse = {
  accessToken: string | null;
  refreshToken: string | null;
  isNewUser: boolean;
  registerToken: string | null;
};

export type RegisterResponse = {
  accessToken: string;
  refreshToken: string;
  userId: number;
};

export function kakaoLogin(code: string, redirectUri: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login/kakao", {
    method: "POST",
    body: { code, redirectUri },
    auth: false,
  });
}

export function register(
  registerToken: string,
  request: { nickname: string; phoneNumber?: string; agreedTerms: string[] }
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: request,
    token: registerToken,
  });
}

export function logout(refreshToken: string | null): Promise<string> {
  return apiFetch<string>("/auth/logout", {
    method: "POST",
    body: refreshToken ? { refreshToken } : undefined,
  });
}
