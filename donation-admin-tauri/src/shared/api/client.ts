import { API_BASE_URL } from "../config/server";
import type { TokenResponse } from "../../entities/user/model/types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
};

type ErrorResponse = {
  message?: string;
  error?: string;
};

type AuthSessionConfig = {
  getRefreshToken: () => string;
  onRefresh: (tokens: TokenResponse) => void;
  onExpired: () => void;
};

let authSessionConfig: AuthSessionConfig | null = null;
let refreshPromise: Promise<TokenResponse> | null = null;

export function configureAuthSession(config: AuthSessionConfig | null) {
  authSessionConfig = config;
}

async function refreshAccessToken() {
  if (!authSessionConfig) return null;

  const refreshToken = authSessionConfig.getRefreshToken();
  if (!refreshToken) return null;

  refreshPromise ??= fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) throw new ApiError(response.status, "세션이 만료되었습니다.");
      return (await response.json()) as TokenResponse;
    })
    .then((tokens) => {
      authSessionConfig?.onRefresh(tokens);
      return tokens;
    })
    .catch((error) => {
      authSessionConfig?.onExpired();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function parseError(response: Response) {
  let message = "요청을 처리하지 못했습니다.";
  try {
    const error = (await response.json()) as ErrorResponse;
    message = error.message || error.error || message;
  } catch {
    // JSON error body가 아니면 기본 메시지를 사용한다.
  }
  return new ApiError(response.status, message);
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", token, body }: ApiRequestOptions = {},
): Promise<T> {
  const request = (accessToken?: string) => fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let response = await request(token);

  if (response.status === 401 && token && path !== "/api/auth/refresh") {
    try {
      const refreshed = await refreshAccessToken();
      if (refreshed?.accessToken) {
        response = await request(refreshed.accessToken);
      }
    } catch {
      throw await parseError(response);
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
