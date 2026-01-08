import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Routes protégées qui nécessitent une authentification
 * Correspond aux pages du groupe (app)
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/budget",
  "/depenses",
  "/patrimoine",
  "/parametres",
] as const;

/**
 * Routes d'authentification (login, signup, etc.)
 * Les utilisateurs connectés seront redirigés vers le dashboard
 */
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"] as const;

/**
 * Routes qui nécessitent une authentification mais avec un flow spécial
 * (ex: onboarding après inscription)
 */
const SPECIAL_AUTH_ROUTES = ["/onboarding"] as const;

/**
 * Vérifie si le pathname correspond à une des routes
 */
function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Toujours utiliser getUser() et non getSession() pour la sécurité
  // getUser() vérifie le token auprès du serveur Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. Routes protégées - redirige vers login si non authentifié
  if (matchesRoute(pathname, PROTECTED_ROUTES) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    // Sauvegarde l'URL d'origine pour rediriger après login
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Routes d'authentification - redirige vers dashboard si déjà connecté
  if (matchesRoute(pathname, AUTH_ROUTES) && user) {
    const redirectUrl = request.nextUrl.clone();
    // Vérifie s'il y a une URL de redirection sauvegardée
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    redirectUrl.pathname = redirectTo || "/dashboard";
    redirectUrl.searchParams.delete("redirectTo");
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Routes spéciales (onboarding) - nécessite auth mais pas de redirection auto
  if (matchesRoute(pathname, SPECIAL_AUTH_ROUTES) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
