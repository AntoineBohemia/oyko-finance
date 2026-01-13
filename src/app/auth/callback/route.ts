import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

/**
 * Route handler pour le callback OAuth et la confirmation email
 *
 * Cette route est appelée par Supabase après :
 * - Une connexion OAuth (Google, etc.)
 * - Une confirmation d'email après inscription
 * - Une réinitialisation de mot de passe
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // Récupérer le code d'autorisation et la destination
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type"); // Type de confirmation (signup, recovery, etc.)

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Échanger le code contre une session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Récupérer l'utilisateur pour vérifier l'onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Si c'est une confirmation d'email après inscription
        // Rediriger vers la page de succès
        if (type === "signup" || type === "email") {
          // Vérifier si le profil a été complété
          const { data: profile } = await supabase
            .from("profiles")
            .select("revenus_mensuels")
            .eq("id", user.id)
            .single();

          // Si pas de revenus configurés, c'est une nouvelle inscription
          // Rediriger vers email-confirmed qui redirigera ensuite vers onboarding
          if (!profile?.revenus_mensuels || profile.revenus_mensuels === 0) {
            return NextResponse.redirect(`${origin}/email-confirmed?next=/onboarding`);
          }
        }

        // Vérifier si le profil a été complété pour les autres cas
        const { data: profile } = await supabase
          .from("profiles")
          .select("revenus_mensuels")
          .eq("id", user.id)
          .single();

        // Si pas de revenus configurés, rediriger vers onboarding
        if (!profile?.revenus_mensuels || profile.revenus_mensuels === 0) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      // Redirection vers la destination demandée
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // En cas d'erreur, rediriger vers login avec un message
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
