import type { TokenResponse, UserSummary } from "../../../entities/user/model/types";
import { apiRequest } from "../../../shared/api/client";

export function login(email: string, password: string) {
  return apiRequest<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function signup(email: string, username: string, password: string) {
  return apiRequest<UserSummary>("/api/auth/signup", {
    method: "POST",
    body: { email, username, password },
  });
}

export function me(token: string) {
  return apiRequest<UserSummary>("/api/auth/me", { token });
}

export async function logout(token: string) {
  await apiRequest<void>("/api/auth/logout", {
    method: "POST",
    token,
  });
}
