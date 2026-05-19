import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

async function tryRefresh(
  request: NextRequest,
): Promise<RefreshResult | null> {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch {
    return null;
  }
}

async function forwardToBackend(
  backendUrl: string,
  request: NextRequest,
  token: string | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": request.headers.get("content-type") || "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
  }

  return fetch(backendUrl, {
    method: request.method,
    headers,
    body: body || undefined,
  });
}

function buildResponse(
  backendRes: Response,
  backendBody: string,
  refreshResult: RefreshResult | null,
): NextResponse {
  const contentType = backendRes.headers.get("content-type");
  let responseBody: unknown;
  try {
    responseBody = JSON.parse(backendBody);
  } catch {
    responseBody = backendBody;
  }

  const response = contentType?.includes("application/json")
    ? NextResponse.json(responseBody, { status: backendRes.status })
    : new NextResponse(backendBody, {
        status: backendRes.status,
        headers: { "Content-Type": contentType || "text/plain" },
      });

  if (refreshResult) {
    response.cookies.set("access_token", refreshResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });
    response.cookies.set("refresh_token", refreshResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
  }

  return response;
}

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = new URL(request.url);
  const queryString = url.search;
  const backendUrl = `${BACKEND_URL}/api/v1/${pathStr}${queryString}`;

  let token = request.cookies.get("access_token")?.value;
  let refreshResult: RefreshResult | null = null;

  // Tente refresh si pas de token
  if (!token) {
    refreshResult = await tryRefresh(request);
    if (refreshResult) {
      token = refreshResult.accessToken;
    }
  }

  // Forward au backend
  let res = await forwardToBackend(backendUrl, request, token);
  let resBody = await res.text();

  // Si 401, tente refresh + retry
  if (res.status === 401 && !refreshResult) {
    refreshResult = await tryRefresh(request);
    if (refreshResult) {
      token = refreshResult.accessToken;
      res = await forwardToBackend(backendUrl, request, token);
      resBody = await res.text();
    }
  }

  return buildResponse(res, resBody, refreshResult);
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
