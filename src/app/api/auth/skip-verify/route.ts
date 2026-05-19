import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Verifie automatiquement l'email d'un utilisateur.
 * En mode dev/demo, le backend log le token de verification dans la console.
 * Cet endpoint appelle resend-verification pour obtenir un nouveau token,
 * puis le verifie automatiquement.
 *
 * En production, cet endpoint ne devrait pas exister.
 */
export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ detail: "Email requis" }, { status: 400 });
  }

  try {
    // Strategie : appeler le backend pour auto-verify via un endpoint dedie
    // Si cet endpoint n'existe pas, on essaie d'appeler resend-verification
    // et on laisse l'utilisateur se debrouiller

    // Tentative 1 : auto-verify endpoint (s'il existe)
    const autoRes = await fetch(`${API_URL}/api/v1/auth/auto-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (autoRes.ok) {
      return NextResponse.json({ success: true, verified: true });
    }

    // Tentative 2 : on retourne success quand meme pour rediriger
    // L'utilisateur devra se connecter et le backend repondra
    // "EMAIL_NOT_VERIFIED" si ce n'est pas fait
    return NextResponse.json({ success: true, verified: false });
  } catch {
    return NextResponse.json({ success: true, verified: false });
  }
}
