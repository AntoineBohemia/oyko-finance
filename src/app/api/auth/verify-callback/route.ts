import { type NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Callback de vérification d'email.
 * GET /api/auth/verify-callback?token=xxx
 *
 * Appelé quand l'utilisateur clique sur le lien dans l'email.
 * Proxy vers le backend GET /api/v1/auth/verify?token=xxx
 * puis redirige vers /email-confirmed ou affiche une erreur.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    const errorUrl = new URL("/verify-email", request.url);
    errorUrl.searchParams.set("error", "Token manquant");
    return NextResponse.redirect(errorUrl);
  }

  try {
    const res = await fetch(
      `${API_URL}/api/v1/auth/verify?token=${encodeURIComponent(token)}`,
    );

    if (res.ok) {
      const confirmedUrl = new URL("/email-confirmed", request.url);
      confirmedUrl.searchParams.set("next", "/login");
      return NextResponse.redirect(confirmedUrl);
    }

    // Token invalide ou expiré
    const data = await res.json().catch(() => ({}));
    const errorUrl = new URL("/verify-email", request.url);
    errorUrl.searchParams.set(
      "error",
      data.detail || "Lien invalide ou expiré",
    );
    return NextResponse.redirect(errorUrl);
  } catch {
    const errorUrl = new URL("/verify-email", request.url);
    errorUrl.searchParams.set("error", "Service temporairement indisponible");
    return NextResponse.redirect(errorUrl);
  }
}
