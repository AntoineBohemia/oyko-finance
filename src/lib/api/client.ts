const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getBaseUrl(): string {
  if (typeof window === "undefined") return BACKEND_URL;
  return "";
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | undefined>;
};

export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail: string;
  instance?: string;
  violations?: { field: string; message: string }[];
}

export class ApiError extends Error {
  public problemDetail: ProblemDetail;

  constructor(pd: ProblemDetail) {
    super(pd.detail);
    this.name = "ApiError";
    this.problemDetail = pd;
  }

  get status() {
    return this.problemDetail.status;
  }
  get detail() {
    return this.problemDetail.detail;
  }
  get violations() {
    return this.problemDetail.violations;
  }
  get isUnauthorized() {
    return this.status === 401;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isValidationError() {
    return this.status === 400 && !!this.violations?.length;
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
}

// Client-side 401 interceptor: refresh token and retry once
let refreshPromise: Promise<boolean> | null = null;

async function tryClientRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh attempts
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const res = await fetch(url, init);

  // Client-side only: retry on 401 after refreshing token
  if (res.status === 401 && typeof window !== "undefined") {
    const refreshed = await tryClientRefresh();
    if (refreshed) {
      return fetch(url, init);
    }
  }

  return res;
}

export async function api<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, params } = options;

  let url = `${getBaseUrl()}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const authHeaders = await getAuthHeaders();

  const res = await fetchWithRetry(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ detail: res.statusText, status: res.status }));
    throw new ApiError({
      type: error.type,
      title: error.title,
      status: res.status,
      detail: error.detail || error.message || res.statusText,
      instance: error.instance,
      violations: error.violations,
    });
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
