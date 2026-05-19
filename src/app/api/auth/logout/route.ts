import { type NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const accessToken = request.cookies.get("access_token")?.value;

  // Revoquer le refresh token cote backend
  if (refreshToken) {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // On continue meme si le backend echoue
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}
