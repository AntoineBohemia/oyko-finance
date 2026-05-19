import { api } from "./client";

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = {
  email: string;
  password: string;
  prenom: string;
  nom: string;
};
export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; prenom: string; nom: string };
};

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return api<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: data,
  });
}

export async function register(
  data: RegisterRequest,
): Promise<{ message: string }> {
  return api<{ message: string }>("/api/v1/auth/register", {
    method: "POST",
    body: data,
  });
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  return api<AuthResponse>("/api/v1/auth/refresh", {
    method: "POST",
    body: { refreshToken: token },
  });
}

export async function logout(): Promise<void> {
  return api<void>("/api/v1/auth/logout", { method: "POST" });
}

export async function verifyEmail(
  token: string,
): Promise<{ message: string }> {
  return api<{ message: string }>("/api/v1/auth/verify", {
    params: { token },
  });
}
