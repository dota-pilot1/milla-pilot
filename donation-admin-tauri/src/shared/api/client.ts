import { API_BASE_URL } from "../config/server";

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

export async function apiRequest<T>(
  path: string,
  { method = "GET", token, body }: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    let message = "요청을 처리하지 못했습니다.";
    try {
      const error = (await response.json()) as ErrorResponse;
      message = error.message || error.error || message;
    } catch {
      // JSON error body가 아니면 기본 메시지를 사용한다.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
