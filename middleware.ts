import { type NextRequest, NextResponse } from "next/server";

const ENV_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE !== "false";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/budget",
  "/depenses",
  "/patrimoine",
  "/parametres",
  "/bank",
  "/onboarding",
];
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-email",
  "/email-confirmed",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dev mode : bypass auth (env var OU cookie)
  const devCookie = request.cookies.get("dev_mode")?.value === "true";
  if (ENV_DEV_MODE || devCookie) {
    if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshTokenValue = request.cookies.get("refresh_token")?.value;
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuth = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Pas de token et route protegee → login
  if (!accessToken && isProtected) {
    // Tenter refresh si disponible
    if (refreshTokenValue) {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
        });

        if (res.ok) {
          const data = await res.json();
          const response = NextResponse.next();
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
        }
      } catch {
        // Refresh failed
      }
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token present et page auth → dashboard
  if (accessToken && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
