import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE !== "false" || request.cookies.get("dev_mode")?.value === "true";

  if (!token && !isDevMode) {
    return NextResponse.json(
      { detail: "Non authentifie" },
      { status: 401 },
    );
  }

  // En dev mode sans token, retourner une URL mock
  if (!token) {
    return NextResponse.json({
      connectUrl: "https://mock-bank.oyko.space/connect?dev=true",
      connectionId: "dev-connection",
    });
  }

  const body = await request.json().catch(() => ({}));

  // Construire le callback URL vers la page /bank/callback du frontend
  const origin = request.headers.get("origin") || request.headers.get("host") || "http://localhost:3000";
  const callbackUrl = origin.startsWith("http")
    ? `${origin}/bank/callback`
    : `http://${origin}/bank/callback`;

  const res = await fetch(`${API_URL}/api/v1/bank/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...body, callbackUrl }),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
