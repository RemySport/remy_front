import { getAccessToken } from "@/lib/auth/tokenStorage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type BaseResponse<T> = {
  code: number | string;
  message: string;
  result: T;
  isSuccess: boolean;
};

export class ApiError extends Error {
  code: number | string;
  status: number;

  constructor(message: string, code: number | string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

let unauthorizedHandler: (() => void) | null = null;

/** AuthContext가 mount 시 등록해서, 401 응답을 받으면 저장된 토큰을 정리하도록 한다. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** 저장된 accessToken 대신 사용할 토큰 (예: registerToken). */
  token?: string;
  /** 저장된 accessToken을 자동으로 붙이지 않으려면 false. 기본 true. */
  auth?: boolean;
};

/** { keyword: "a", page: 1, size: undefined } -> "?keyword=a&page=1" */
export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const token = options.token ?? (options.auth !== false ? getAccessToken() : null);
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let json: BaseResponse<T> | null = null;
  try {
    json = await res.json();
  } catch {
    // 응답 바디가 없는 경우 (204 등)
  }

  if (!res.ok || !json || json.isSuccess === false) {
    if (res.status === 401) unauthorizedHandler?.();
    throw new ApiError(
      json?.message ?? `요청에 실패했습니다. (${res.status})`,
      json?.code ?? res.status,
      res.status
    );
  }

  return json.result;
}
