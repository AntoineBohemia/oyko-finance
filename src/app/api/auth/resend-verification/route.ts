import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Proxy vers le backend pour renvoyer l'email de vérification.
 * POST /api/auth/resend-verification
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ detail: "Email requis" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { detail: "Service temporairement indisponible" },
      { status: 503 },
    );
  }
}
