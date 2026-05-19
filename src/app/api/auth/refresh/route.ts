import { type NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    const response = NextResponse.json(
      { detail: "No refresh token" },
      { status: 401 },
    );
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      const response = NextResponse.json(
        { detail: "Refresh failed" },
        { status: 401 },
      );
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      return response;
    }

    const data = await res.json();
    const response = NextResponse.json({ user: data.user });

    response.cookies.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    response.cookies.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch {
    const response = NextResponse.json(
      { detail: "Refresh error" },
      { status: 401 },
    );
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }
}
