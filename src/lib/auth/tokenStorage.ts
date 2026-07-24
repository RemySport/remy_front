const ACCESS_TOKEN_KEY = "remy.accessToken";
const REFRESH_TOKEN_KEY = "remy.refreshToken";
const REGISTER_TOKEN_KEY = "remy.registerToken";

function getItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function setItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

function removeItem(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export function getAccessToken(): string | null {
  return getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  setItem(ACCESS_TOKEN_KEY, accessToken);
  setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  removeItem(ACCESS_TOKEN_KEY);
  removeItem(REFRESH_TOKEN_KEY);
}

// registerToken(회원가입용 임시 토큰)은 세션 동안만 필요해 sessionStorage에 둔다.
export function getRegisterToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(REGISTER_TOKEN_KEY);
}

export function setRegisterToken(token: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(REGISTER_TOKEN_KEY, token);
}

export function clearRegisterToken() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(REGISTER_TOKEN_KEY);
}
