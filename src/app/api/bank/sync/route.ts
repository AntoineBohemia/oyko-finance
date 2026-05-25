import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { detail: "Non authentifie" },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));

  const res = await fetch(`${API_URL}/api/v1/bank/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
