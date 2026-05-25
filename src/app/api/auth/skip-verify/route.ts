import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === "true";

/**
 * Auto-vérifie l'email d'un utilisateur.
 * UNIQUEMENT disponible en mode développement.
 * En production, cet endpoint retourne 403.
 */
export async function POST(request: NextRequest) {
  if (!IS_DEV) {
    return NextResponse.json(
      { detail: "Endpoint désactivé en production" },
      { status: 403 },
    );
  }

  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ detail: "Email requis" }, { status: 400 });
  }

  try {
    const autoRes = await fetch(`${API_URL}/api/v1/auth/auto-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (autoRes.ok) {
      return NextResponse.json({ success: true, verified: true });
    }

    return NextResponse.json({ success: true, verified: false });
  } catch {
    return NextResponse.json({ success: true, verified: false });
  }
}
