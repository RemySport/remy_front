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

/** QA용 이메일/비밀번호 테스트 계정 로그인. 성공 시 소셜 로그인과 동일하게 토큰이 바로 발급된다. */
export function testLogin(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login/test", {
    method: "POST",
    body: { email, password },
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
